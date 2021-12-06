import * as fs from 'fs'
import * as path from 'path'
import fetch from 'node-fetch'
import { MessageType, proto, ReconnectMode, WAChat, WAChatUpdate, WAConnection } from '@adiwajshing/baileys'
import mime from "mime-types"
import qrcode from "qrcode";
import agent from "superagent"
import db, { Asset } from "./db"
import supabase from "./services/supabase"
import googleDriveRepository from "./respository/google-drive"
import dayjs from 'dayjs'

export enum MissMarbleChatJids {
  OrderReports = "85298115672-1594034860@g.us"
  // OrderReports = "85265530162@s.whatsapp.net"
}

function chatIsMissMarble(chat: WAChat | WAChatUpdate) {
  const isGroupChat = chat.jid.includes("-");

  return isGroupChat && (
    chat.name?.includes("order")
    || chat.name?.includes("牌")
    || chat.name?.includes("複雜單")
  );
}

let missMarbleChats: WAChat[];

async function saveOrderAssetFromMessage(conn: WAConnection,m: proto.WebMessageInfo): Promise<any> {
  const [messageType] = Object.keys(m.message)

  if (messageType === MessageType.image) {
    const buffer = await conn.downloadMediaMessage(m).catch(() => {})

    if (!buffer) {
      return null;
    }

    const { mimetype } = m.message.imageMessage;
    const filename = `${m.key.id}.${mime.extension(mimetype)}`;

    const content = await supabase.storage.from("order-assets").upload(
      filename,
      buffer,
      { contentType: mimetype }
    );

    // Most probably duplicate content, can be other errors as well but whatever
    if (content.error) {
      return null
    }

    return db.asset.create({
      data: {
        bucketName: "order-assets",
        bucketKey: content.data.Key,
        createdAt: new Date(+m.messageTimestamp.toString() * 1000),
        meta: {
          caption: m.message.imageMessage.caption
        }
      }
    })
  }
}

export async function connectToWhatsApp () {
  await googleDriveRepository.init()
  const conn = new WAConnection()

  conn.autoReconnect = ReconnectMode.onAllErrors

  // called when WA sends chats
  // this can take up to a few minutes if you have thousands of chats!
  conn.on('chats-received', async ({ hasNewChats }) => {
      console.log(`you have ${conn.chats.length} chats, new chats available: ${hasNewChats}`)

      missMarbleChats = conn.chats.all().filter(chatIsMissMarble);

      console.log(`Fetched ${missMarbleChats.length} order chats`)

      for (const chat of missMarbleChats) {
        let cursor: { id?: string, fromMe?: boolean };

        let fetchedTilYesterday = false
        while (!fetchedTilYesterday) {
          const messagesPage = await conn.loadMessages(chat.jid, 50, cursor, true);
          cursor = messagesPage.cursor

          console.log(`Fetched ${messagesPage.messages.length} messages til`, cursor)

          if (messagesPage.messages.length === 0) {
            break
          }

          for (const m of messagesPage.messages) {
            if (!m.message || m.key.fromMe) {
              continue
            }

            await saveOrderAssetFromMessage(conn, m)

            // Fetch up to start of today
            // console.log(`Last fetched message sent at ${dayjs(+m.messageTimestamp.toString() * 1000).toISOString()}`)
            if (dayjs(+m.messageTimestamp.toString() * 1000).isBefore(dayjs().startOf("day"))) {
              fetchedTilYesterday = true;
              break;
            }
          }
        }
      }

      console.log("Finished fetching existing messages til yesterday")
  })

  // TODO: chat update doesnt have chat name, need to cache mapping in chat received
  conn.on('chat-update', async (chatUpdate) => {
    if (missMarbleChats.find(chat => chat.jid === chatUpdate.jid)) {
      return
    }

    // `chatUpdate` is a partial object, containing the updated properties of the chat
    // received a new message
    if (chatUpdate.messages && chatUpdate.count) {
      console.log("Received new messages", chatUpdate.messages.all())
      for (const m of chatUpdate.messages.all()) {
        if (!m.message || m.key.fromMe) {
          continue;
        }

        // await saveOrderAssetFromMessage(conn, m)
      }
    }
})

  conn.on ('open', async () => {
    // save credentials whenever updated
    console.log (`credentials updated!`)
    const authInfo = conn.base64EncodedAuthInfo() // get all the auth info we need to restore this session
    const stringifiedAuthInfo = JSON.stringify(authInfo, null, '\t');

    await supabase.storage.createBucket("whatsapp-auth-info");

    // TODO: encrypt auth_info before upload
    await supabase.storage.from("whatsapp-auth-info").upload("whatsapp_auth_info.json", stringifiedAuthInfo)

    fs.writeFileSync('./whatsapp_auth_info.json', stringifiedAuthInfo) // save this info to a file
  })

  conn.on('qr', qr => {
    qrcode.toFile(path.resolve(__dirname, '..', 'qr.png'), qr)
  })

  try {
    const { data } = await supabase.storage.from("whatsapp-auth-info").download("whatsapp_auth_info.json")
    fs.writeFileSync('./whatsapp_auth_info.json', await data.text())
  } catch {}

  try {
    conn.loadAuthInfo ('./whatsapp_auth_info.json')
  } catch (error) {
    console.log("Failed to load whatsapp authinfo", error)
  }
  await conn.connect ()

  return conn;
}

async function downloadOrderReport(date: Date) {
  const res = await agent.get(
    `${process.env.GOOGLE_SHEET_SCRIPT_URL}?date=${dayjs(date).toISOString()}&num_of_column=2`
  )
  const downloadUrl = JSON.parse(res.text)?.url;
  return fetch(downloadUrl)
    .then(res => res.buffer())
}

export async function sendOrderReportsToWhatsApp(conn: WAConnection) {
  const dates = [
    dayjs().add(1, 'day').toDate(),
    dayjs().add(2, 'days').toDate()
  ];

  for (const date of dates) {
    await conn.sendMessage(
      MissMarbleChatJids.OrderReports,
      await downloadOrderReport(date),
      MessageType.document,
      { filename: `Orders for ${date.getMonth() + 1}_${date.getDate()} (Paid).pdf`, mimetype: 'application/pdf' }
    );
  }
}