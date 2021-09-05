import * as fs from 'fs'
import { MessageType, ReconnectMode, WAChat, WAChatUpdate, WAConnection } from '@adiwajshing/baileys'
import mime from "mime-types"
import db from "./db"
import supabase from "./services/supabase"
import googleDriveRepository from "./respository/google-drive"

// FIXME: seems group names are irregular, ignore name filter for now
function chatIsMissMarble(chat: WAChat | WAChatUpdate) {
  return chat.jid.includes("-");
}

export async function connectToWhatsApp () {
  await googleDriveRepository.init()
  const conn = new WAConnection()

  conn.autoReconnect = ReconnectMode.onAllErrors

  // called when WA sends chats
  // this can take up to a few minutes if you have thousands of chats!
  // conn.on('chats-received', async ({ hasNewChats }) => {
  //     console.log(`you have ${conn.chats.length} chats, new chats available: ${hasNewChats}`)

  //     const missMarbleChats = conn.chats.all().filter(chatIsMissMarble);

  //     const messagesPage = await conn.loadMessages(missMarbleChats[0].jid, 100);

  //     for (const m of messagesPage.messages) {
  //       if (!m.message) {
  //         continue
  //       }

  //       const [messageType] = Object.keys(m.message)

  //       if (messageType === MessageType.image) {
  //         try {
  //           const buffer = await conn.downloadMediaMessage(m)

  //           const { mimetype } = m.message.imageMessage;
  //           const content = await supabase.storage.from("order-assets").upload(
  //             `${m.key.id}.${mime.extension(mimetype)}`,
  //             buffer,
  //             { contentType: mimetype }
  //           );
  //           await db.asset.create({
  //             data: {
  //               bucketName: "order-assets",
  //               bucketKey: content.data.Key,
  //             }
  //           })
  //         } catch (error) {
  //           console.error(error)
  //         }
  //       }
  //     }
  // })

  conn.on('chat-update', async (chatUpdate) => {
    if (!chatIsMissMarble(chatUpdate)) {
      return
    }

    // `chatUpdate` is a partial object, containing the updated properties of the chat
    // received a new message
    if (chatUpdate.messages && chatUpdate.count) {
      console.log("=== received new messages", chatUpdate.messages.all())
      for (const m of chatUpdate.messages.all()) {
        if (m.key.fromMe) {
          continue;
        }

        const [messageType] = Object.keys(m.message)

        if (messageType === MessageType.image) {
          console.log("Received new image message ", m.key.id, m.message.imageMessage.caption)
          const buffer = await conn.downloadMediaMessage(m)

          const { mimetype } = m.message.imageMessage;
          const content = await supabase.storage.from("order-assets").upload(
            `${m.key.id}.${mime.extension(mimetype)}`,
            buffer,
            { contentType: mimetype }
          );
          await db.asset.create({
            data: {
              bucketName: "order-assets",
              bucketKey: content.data.Key,
            }
          })
        }
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
}
