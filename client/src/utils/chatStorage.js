export const saveChatLog = (chatLog) => {
  try {
    localStorage.setItem('chatLog', JSON.stringify(chatLog));
  } catch (error) {
    console.error('Error saving chat log to localStorage:', error);
  }
};

export const loadChatLog = () => {
  try {
    const chatLogString = localStorage.getItem('chatLog');
    return chatLogString ? JSON.parse(chatLogString) : [];
  } catch (error) {
    console.error('Error loading chat log from localStorage:', error);
    return [];
  }
};

export const clearChatLog = () => {
  try {
    localStorage.removeItem('chatLog');
  } catch (error) {
    console.error('Error clearing chat log from localStorage:', error);
  }
};
