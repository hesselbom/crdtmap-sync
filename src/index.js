// Heavily influenced by https://github.com/yjs/y-protocols/blob/master/sync.js

const VDoc = require('vjs')
const encoding = require('lib0/dist/encoding.cjs')
const decoding = require('lib0/dist/decoding.cjs')

export const V_MESSAGE_SYNC_1 = 0
export const V_MESSAGE_SYNC_2 = 1
export const V_MESSAGE_UPDATE = 2

// Create a sync step 1 message based on the state of the current shared document.
export function writeSyncStep1 (encoder, doc) {
  encoding.writeVarUint(encoder, V_MESSAGE_SYNC_1)
  encoding.writeVarUint8Array(encoder, VDoc.encodeStateVectors(doc.getStateVectors()))
}

export function writeSyncStep2 (encoder, doc, encodedStateVectors) {
  const stateVectors = VDoc.decodeStateVectors(encodedStateVectors)

  encoding.writeVarUint(encoder, V_MESSAGE_SYNC_2)
  encoding.writeVarUint8Array(encoder, VDoc.encodeSnapshot(doc.getSnapshotFromStateVectors(stateVectors)))
}

// Read SyncStep1 message and reply with SyncStep2
export function readSyncStep1 (decoder, encoder, doc) {
  writeSyncStep2(encoder, doc, decoding.readVarUint8Array(decoder))
}

// Apply snapshot from sync step 2
export function readSyncStep2 (decoder, doc) {
  const snapshot = VDoc.decodeSnapshot(decoding.readVarUint8Array(decoder))
  doc.applySnapshot(snapshot)
}

export function writeUpdate (encoder, snapshot) {
  encoding.writeVarUint(encoder, V_MESSAGE_UPDATE)
  encoding.writeVarUint8Array(encoder, snapshot)
}

export const readUpdate = readSyncStep2

/**
 * @param {decoding.Decoder} decoder A message received from another client
 * @param {encoding.Encoder} encoder The reply message. Will not be sent if empty.
 * @param {VDoc} doc
 */
export function readSyncMessage (decoder, encoder, doc) {
  const messageType = decoding.readVarUint(decoder)
  switch (messageType) {
    case V_MESSAGE_SYNC_1:
      readSyncStep1(decoder, encoder, doc)
      break
    case V_MESSAGE_SYNC_2:
      readSyncStep2(decoder, doc)
      break
    case V_MESSAGE_UPDATE:
      readUpdate(decoder, doc)
      break
    default:
      throw new Error('Unknown message type')
  }
  return messageType
}
