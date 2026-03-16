export type AuthStackParamList = {
  Login: undefined;
};

export type ChatStackParamList = {
  ConversationList: undefined;
  DMChat: { conversationId: string; recipientId: string };
  GroupChat: { conversationId: string };
  ImageViewer: { uri: string };
  ConversationInfo: { conversationId: string };
};

export type AdminStackParamList = {
  AdminUsers: undefined;
  WebhookLogs: undefined;
};

export type MainTabParamList = {
  ChatTab: undefined;
  AdminTab: undefined;
};
