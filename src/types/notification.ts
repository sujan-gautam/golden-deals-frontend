// src/types/notification.ts
export interface Notification {
    _id: string;
    recipient: string;
    sender: {
      _id: string;
      username: string;
      avatar: string;
    };
    type:
      | 'post_like'
      | 'post_comment'
      | 'post_comment_mention'
      | 'event_like'
      | 'event_comment'
      | 'event_interested'
      | 'event_comment_mention'
      | 'product_like'
      | 'product_comment'
      | 'product_comment_mention'
      | 'comment_like'
      | 'new_message';
    content: string;
    post?: { _id: string; content: string };
    event?: { _id: string; event_title: string };
    product?: { _id: string; title: string };
    conversation?: { _id: string; participants: string[] };
    isRead: boolean;
    createdAt: string;
  }