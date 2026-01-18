'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Send, Hash, Paperclip, Globe, Command, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandCenterProps {
    onSend: (message: string, attachments?: string[]) => void;
    disabled?: boolean;
    isThinking?: boolean;
}

export function CommandCenter({ onSend, disabled, isThinking }: CommandCenterProps) {
    const [value, setValue] = useState('');
    const [attachments, setAttachments] = useState<string[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        if ((value.trim() || attachments.length > 0) && !disabled) {
            onSend(value.trim(), attachments);
            setValue('');
            setAttachments([]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachments(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);

    return (
        <div className="p-6">
            <div className={cn(
                "relative flex flex-col rounded-2xl border transition-all duration-500 glass",
                isThinking ? "thinking-border ring-4 ring-agent-thinking/5" : "border-border/50 focus-within:border-agent-thinking/40"
            )}>
                <div className="flex items-center gap-2 border-b border-border/30 px-4 py-2 text-[10px] uppercase tracking-widest text-foreground/30 font-bold">
                    <Command className="h-3 w-3" />
                    <span>Neural Link :: Ready</span>
                </div>

                {/* Attachments Preview */}
                <AnimatePresence>
                    {attachments.length > 0 && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="flex flex-wrap gap-2 px-4 pt-4 overflow-hidden"
                        >
                            {attachments.map((at, i) => (
                                <div key={i} className="relative group overflow-hidden rounded-lg border border-border/50 shadow-sm h-16 w-16">
                                    <img src={at} alt="upload" className="h-full w-full object-cover" />
                                    <button
                                        onClick={() => removeAttachment(i)}
                                        className="absolute top-1 right-1 h-4 w-4 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3 text-white" />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-start px-2 py-2">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                        placeholder="Ask anything or use '@' to reference context..."
                        className="flex-1 resize-none bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-foreground/20 max-h-[200px] scrollbar-hide"
                    />
                </div>

                <div className="flex items-center justify-between px-3 py-2 border-t border-border/30">
                    <div className="flex items-center gap-1">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            multiple
                            accept="image/*"
                        />
                        <IconButton
                            icon={<Paperclip className="h-4 w-4" />}
                            onClick={() => fileInputRef.current?.click()}
                        />
                        <IconButton icon={<ImageIcon className="h-4 w-4" />} onClick={() => fileInputRef.current?.click()} />
                        <IconButton icon={<Globe className="h-4 w-4" />} />
                        <IconButton icon={<Hash className="h-4 w-4" />} />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={(!value.trim() && attachments.length === 0) || disabled}
                        className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                            (value.trim() || attachments.length > 0) && !disabled
                                ? "bg-agent-thinking text-white shadow-lg shadow-agent-thinking/20"
                                : "bg-foreground/5 text-foreground/20"
                        )}
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>

                <AnimatePresence>
                    {isThinking && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
                        >
                            <div className="absolute inset-x-0 bottom-0 h-[2px] shimmer" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function IconButton({ icon, onClick }: { icon: any, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/30 transition-colors hover:bg-foreground/5 hover:text-foreground/60"
        >
            {icon}
        </button>
    );
}
