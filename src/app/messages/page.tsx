
'use client';

import { useState, useRef, useEffect } from 'react';
import { SiteHeader } from '@/components/common/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { placeholderImages } from '@/lib/placeholder-images';
import { users } from '@/lib/data';

// Mock data for chat conversations
const conversations = [
  {
    id: 'convo-1',
    userId: '1',
    lastMessage: 'Sure, I can help with that!',
    timestamp: '10:40 AM',
    unreadCount: 1,
  },
  {
    id: 'convo-2',
    userId: '2',
    lastMessage: 'Project is looking great. One more change...',
    timestamp: '9:15 AM',
    unreadCount: 0,
  },
   {
    id: 'convo-3',
    userId: '3',
    lastMessage: 'What time works for you tomorrow?',
    timestamp: 'Yesterday',
    unreadCount: 0,
  },
];

const initialMessages = [
  { id: 'msg-1', senderId: '1', text: 'Hey! I saw your request for Calculus tutoring.', isCurrentUser: false },
  { id: 'msg-2', senderId: 'current_user', text: 'Hi! Yes, I\'m struggling a bit with integration.', isCurrentUser: true },
  { id: 'msg-3', senderId: '1', text: 'Sure, I can help with that!', isCurrentUser: false },
]

export default function MessagesPage() {
  const activeChatConvo = conversations[0];
  const activeChatUser = users.find(u => u.id === activeChatConvo.userId);
  const activeChatAvatar = activeChatUser ? placeholderImages.find(p => p.id === activeChatUser.avatarId) : null;
  
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const message = {
      id: `msg-${Date.now()}`,
      senderId: 'current_user',
      text: newMessage,
      isCurrentUser: true,
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);


  return (
    <div className="flex flex-col h-screen">
      <SiteHeader />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {/* Sidebar with conversations */}
        <Card className="md:col-span-1 lg:col-span-1 flex flex-col">
          <CardHeader className="p-4">
            <CardTitle>Messages</CardTitle>
             <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search messages..." className="pl-8" />
             </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <CardContent className="p-2 space-y-1">
              {conversations.map((convo) => {
                const user = users.find(u => u.id === convo.userId);
                if (!user) return null;
                const avatar = placeholderImages.find(p => p.id === user.avatarId);
                return (
                  <div key={convo.id} className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-muted bg-card">
                    <Avatar className="h-10 w-10 mr-3">
                      {avatar && <AvatarImage src={avatar.imageUrl} alt={user.name} />}
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold">{user.name}</div>
                      <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                        <div>{convo.timestamp}</div>
                        {convo.unreadCount > 0 && 
                            <div className="mt-1 flex justify-end">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                                    {convo.unreadCount}
                                </span>
                            </div>
                        }
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </ScrollArea>
        </Card>

        {/* Main chat area */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col">
           {activeChatUser && (
            <Card className="flex-1 flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-4">
                        <Avatar>
                            {activeChatAvatar && <AvatarImage src={activeChatAvatar.imageUrl} alt={activeChatUser.name} />}
                            <AvatarFallback>{activeChatUser.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium leading-none">{activeChatUser.name}</p>
                            <p className="text-sm text-muted-foreground">Online</p>
                        </div>
                    </div>
                </CardHeader>
                <div className="flex-1 overflow-y-auto p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                    {messages.map((msg) => {
                        const sender = msg.isCurrentUser ? null : users.find(u => u.id === msg.senderId);
                        const senderAvatar = sender ? placeholderImages.find(p => p.id === sender.avatarId) : null;
                        return (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.isCurrentUser ? 'justify-end' : ''}`}>
                            {!msg.isCurrentUser && sender && (
                                <Avatar className="h-8 w-8">
                                    {senderAvatar && <AvatarImage src={senderAvatar.imageUrl} alt={sender.name}/>}
                                    <AvatarFallback>{sender.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={`rounded-lg px-4 py-2 max-w-[70%] ${msg.isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                            {msg.isCurrentUser && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>ME</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                        )
                    })}
                </div>
                </div>
                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="relative">
                    <Input 
                      placeholder="Type your message..." 
                      className="pr-12"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </form>
                </div>
            </Card>
           )}
        </div>
      </main>
    </div>
  );
}
