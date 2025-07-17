
'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chatWithAssistant } from '@/ai/flows/assistant-flow';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

export function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', text: "Hello! How can I help you with the Staffable app today?" }
    ]);
    const [input, setInput] = useState('');
    const [isPending, startTransition] = useTransition();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const toggleOpen = () => setIsOpen(prev => !prev);

    useEffect(() => {
        if (isOpen && scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isPending) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        startTransition(async () => {
            const response = await chatWithAssistant({ query: input });
            if (response.response) {
                const assistantMessage: Message = { role: 'assistant', text: response.response };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                 const errorMessage: Message = { role: 'assistant', text: "I'm sorry, I couldn't process that. Please try again." };
                setMessages(prev => [...prev, errorMessage]);
            }
        });
    };

    return (
        <>
            <div className={cn("fixed bottom-6 right-6 z-50 transition-transform duration-300 ease-in-out", { 'scale-0': isOpen, 'scale-100': !isOpen })}>
                <Button onClick={toggleOpen} size="lg" className="rounded-full w-16 h-16 shadow-lg">
                    <MessageSquare className="h-8 w-8" />
                </Button>
            </div>

            <div className={cn("fixed bottom-6 right-6 z-50 transition-opacity duration-300 ease-in-out", { 'opacity-0 pointer-events-none': !isOpen, 'opacity-100': isOpen })}>
                <Card className="w-[380px] h-[500px] flex flex-col shadow-2xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bot className="h-6 w-6 text-primary" />
                            <CardTitle>AI Assistant</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" onClick={toggleOpen}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0">
                         <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                            <div className="space-y-4">
                                {messages.map((message, index) => (
                                    <div key={index} className={cn("flex items-start gap-3", { 'justify-end': message.role === 'user' })}>
                                        {message.role === 'assistant' && (
                                            <Avatar className="w-8 h-8">
                                                <div className="flex items-center justify-center w-full h-full rounded-full bg-primary text-primary-foreground">
                                                    <Bot className="h-5 w-5" />
                                                </div>
                                            </Avatar>
                                        )}
                                        <div className={cn("p-3 rounded-lg max-w-[80%]", {
                                            'bg-muted': message.role === 'assistant',
                                            'bg-primary text-primary-foreground': message.role === 'user'
                                        })}>
                                            <p className="text-sm">{message.text}</p>
                                        </div>
                                         {message.role === 'user' && (
                                            <Avatar className="w-8 h-8">
                                                 <div className="flex items-center justify-center w-full h-full rounded-full bg-secondary text-secondary-foreground">
                                                    <User className="h-5 w-5" />
                                                </div>
                                            </Avatar>
                                        )}
                                    </div>
                                ))}
                                {isPending && (
                                    <div className="flex items-start gap-3">
                                         <Avatar className="w-8 h-8">
                                            <div className="flex items-center justify-center w-full h-full rounded-full bg-primary text-primary-foreground">
                                                <Bot className="h-5 w-5" />
                                            </div>
                                        </Avatar>
                                        <div className="p-3 rounded-lg bg-muted">
                                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter>
                        <form onSubmit={handleSubmit} className="flex w-full gap-2">
                            <Input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                disabled={isPending}
                            />
                            <Button type="submit" size="icon" disabled={isPending}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
