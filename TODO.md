# Chronix - Server-Side Message Persistence

## Plan

### Step 1: Create `backend/messageStore.js`
- File-based JSON message store (encrypted, following deviceRegistry pattern)
- Functions: `storeMessage()`, `getMessages()`, `getAllMessages()`

### Step 2: Modify `backend/Server.js`
- Import messageStore
- Persist messages on `chat:message` event
- Add `messages:history` socket event for clients to fetch history
- Add REST endpoint `GET /api/messages/:chatId`

### Step 3: Modify `frontend/src/app/Chat/page.js`
- After socket connects, request server-side message history
- Merge server messages with local IndexedDB messages

