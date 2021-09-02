import * as fs from 'fs'
import { MessageType, WAChat, WAChatUpdate, WAConnection } from '@adiwajshing/baileys'
import mime from "mime-types"
import supabase from "./services/supabase"
import googleDriveRepository from "./respository/google-drive"

function chatIsMissMarble(chat: WAChat | WAChatUpdate) {
  return chat.name?.includes("@marble") && chat.jid.includes("-");
}

export async function connectToWhatsApp () {
  await googleDriveRepository.init()
  const conn = new WAConnection()
  // called when WA sends chats
  // this can take up to a few minutes if you have thousands of chats!
  // conn.on('chats-received', async ({ hasNewChats }) => {
  //     console.log(`you have ${conn.chats.length} chats, new chats available: ${hasNewChats}`)

  //     const missMarbleChats = conn.chats.all().filter(chatIsMissMarble);

  //     const messagesPage = await conn.loadMessages(missMarbleChats[0].jid, 10);

  //     for (const m of messagesPage.messages) {
  //       const [messageType] = Object.keys(m.message)

  //       if (messageType === MessageType.image) {
  //         const buffer = await conn.downloadMediaMessage(m)

  //         const { mimetype } = m.message.imageMessage;
  //         await supabase.storage.from("order-assets").upload(
  //           `${m.key.id}.${mime.extension(mimetype)}`,
  //           buffer,
  //           { contentType: mimetype }
  //         );
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
          await supabase.storage.from("order-assets").upload(
            `${m.key.id}.${mime.extension(mimetype)}`,
            buffer,
            { contentType: mimetype }
          );
        }
      }
    }
})

  conn.on("message-new", async (m) => {
    if (!m.message) {
      return;
    }

    const [messageType] = Object.keys(m.message)

    if (messageType === MessageType.image) {
      // const buffer = await conn.downloadMediaMessage(m)
      // @ts-expect-error
      const savedFilename = await conn.downloadAndSaveMediaMessage(m)
      console.log(m.key.remoteJid + " sent media, saved at: " + savedFilename)
    }
  })

  conn.on ('open', async () => {
    // save credentials whenever updated
    console.log (`credentials updated!`)
    const authInfo = conn.base64EncodedAuthInfo() // get all the auth info we need to restore this session
    const stringifiedAuthInfo = JSON.stringify(authInfo, null, '\t');

    await supabase.storage.createBucket("whatsapp-auth-nfo");

    // TODO: encrypt auth_info before upload
    await supabase.storage.from("whatsapp-auth-nfo").upload("whatsapp_auth_info.json", stringifiedAuthInfo)

    fs.writeFileSync('./whatsapp_auth_info.json', stringifiedAuthInfo) // save this info to a file
  })

  try {
    const { data } = await supabase.storage.from("whatsapp-auth-nfo").download("whatsapp_auth_info.json")
    console.log("=== whatsapp", await data.text())
    fs.writeFileSync('./whatsapp_auth_info.json', await data.text())
  } catch {}

  try {
    conn.loadAuthInfo ('./whatsapp_auth_info.json')
  } catch (error) {
    console.log("=== error", error)
  }
  await conn.connect ()
}
