export function mapMessageToFileNames(msg) {
  return [
    `${msg._type}.${msg.note}.${msg.channel}.${msg.velocity}`,
    `${msg._type}.${msg.note}.${msg.channel}`,
    `${msg._type}.${msg.note}`,
  ];
}
