"use client"

import { useEffect, useState } from 'react';
import { matrixService } from '@/lib/matrix-service';
import { Room } from 'matrix-js-sdk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2, LogIn, Users, Hash } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // This is for demonstration. In a real app, get this from secure storage.
  const MOCK_USER = {
    userId: process.env.NEXT_PUBLIC_MATRIX_USER_ID || "",
    password: process.env.NEXT_PUBLIC_MATRIX_PASSWORD || "",
  };

  useEffect(() => {
    const initMatrix = async () => {
      try {
        if (!MOCK_USER.userId || !MOCK_USER.password) {
            toast.error("Matrix credentials not configured.", {
                description: "Please set NEXT_PUBLIC_MATRIX_USER_ID and NEXT_PUBLIC_MATRIX_PASSWORD in your environment."
            })
            setIsLoading(false);
            return;
        }

        const client = matrixService.initializeClient();

        client.on('sync', (state, prevState, data) => {
          if (state === 'PREPARED') {
            setIsLoggedIn(true);
            setIsLoading(false);
            const roomList = client.getRooms();
            setRooms(roomList);
            toast.success("Matrix client synced successfully.");
          }
        });

        await matrixService.loginWithPassword(MOCK_USER.userId, MOCK_USER.password);
        await client.startClient({ initialSyncLimit: 10 });

      } catch (error: any) {
        console.error("Matrix login failed", error);
        toast.error("Matrix login failed", { description: error?.message || 'Please check credentials and server.' });
        setIsLoading(false);
      }
    };

    initMatrix();

    return () => {
      matrixService.logout();
    };
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      const timeline = selectedRoom.getLiveTimeline();
      const messageEvents = timeline.getEvents().filter(e => e.getType() === 'm.room.message');
      setMessages(messageEvents);

      const onTimeline = (event: any) => {
        if (event.getRoomId() === selectedRoom.roomId && event.getType() === 'm.room.message') {
          setMessages(prev => [...prev, event]);
        }
      };

      const client = matrixService.getClient();
      client.on('Room.timeline', onTimeline);

      return () => {
        client.removeListener('Room.timeline', onTimeline);
      };
    }
  }, [selectedRoom]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return;

    const content = {
      body: newMessage,
      msgtype: 'm.text',
    };

    matrixService.getClient().sendEvent(selectedRoom.roomId, 'm.room.message', content, "", (err, res) => {
      if (err) {
        console.error(err);
        toast.error("Failed to send message.");
      } else {
        setNewMessage('');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-terminus-accent">
        <Loader2 className="h-16 w-16 animate-spin mr-4" />
        <span className="text-2xl tracking-widest">CONNECTING TO MATRIX...</span>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-terminus-warning">
        <LogIn className="h-16 w-16 mb-4" />
        <h2 className="text-2xl mb-2">Authentication Failed</h2>
        <p className="text-terminus-text-primary/70">Could not connect to the Matrix homeserver.</p>
        <p className="text-terminus-text-primary/70">Please check your credentials and network.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-terminus-bg-secondary/50 border border-terminus-border rounded-lg">
      {/* Room List */}
      <div className="w-1/4 border-r border-terminus-border flex flex-col">
        <div className="p-4 border-b border-terminus-border">
          <h2 className="text-xl font-bold">Secure Channels</h2>
        </div>
        <ScrollArea className="flex-1">
          {rooms.map(room => (
            <div
              key={room.roomId}
              className={`p-4 cursor-pointer flex items-center gap-3 transition-colors ${selectedRoom?.roomId === room.roomId ? 'bg-terminus-accent/10' : 'hover:bg-terminus-bg-secondary'}`}
              onClick={() => setSelectedRoom(room)}
            >
              <Avatar className="h-10 w-10 border-2 border-terminus-border">
                <AvatarImage src={room.getAvatarUrl('https://matrix.org', 40, 40, 'scale', false)} />
                <AvatarFallback className="bg-terminus-bg-primary">
                    {room.name.includes('#') || room.name.includes('@') ? <Hash /> : <Users />}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold truncate">{room.name}</span>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Message Pane */}
      <div className="w-3/4 flex flex-col">
        {selectedRoom ? (
          <>
            <div className="p-4 border-b border-terminus-border">
              <h3 className="text-xl font-bold">{selectedRoom.name}</h3>
              <p className="text-sm text-terminus-text-primary/60">{selectedRoom.getTopic() || 'No topic set'}</p>
            </div>
            <ScrollArea className="flex-1 p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.getId()} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{msg.getSender()?.charAt(1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-terminus-accent">{msg.sender?.name || msg.getSender()}</p>
                    <p className="text-white whitespace-pre-wrap">{msg.getContent().body}</p>
                    <p className="text-xs text-terminus-text-primary/40 mt-1">
                      {new Date(msg.getTs()).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </ScrollArea>
            <div className="p-4 border-t border-terminus-border flex items-center gap-4">
              <Input
                placeholder={`Message in ${selectedRoom.name}...`}
                className="bg-terminus-bg-primary border-terminus-border focus:ring-terminus-accent h-12"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button size="icon" onClick={handleSendMessage} className="h-12 w-12 flex-shrink-0 bg-terminus-accent hover:bg-terminus-accent/90">
                <Send />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-xl text-terminus-text-primary/70">Select a channel to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
