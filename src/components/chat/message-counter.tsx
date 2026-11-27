interface MessageCounter {
    userMessageCount: number,
    maxUserMessagesPerChat: number,
    isMessageLimitReached: boolean
}

export function MessageCounter({ userMessageCount, maxUserMessagesPerChat, isMessageLimitReached }: MessageCounter) {
    return (
        <div className="flex items-center gap-1 ml-auto">
            <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${isMessageLimitReached
                    ? 'bg-red-500/20 text-red-400'
                    : userMessageCount >= Math.floor(maxUserMessagesPerChat * 0.8)
                        ? 'bg-red-500/20 text-red-400'
                        : userMessageCount >= Math.floor(maxUserMessagesPerChat / 2)
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-[#161111] text-zinc-400'
                    }`}
                title={
                    isMessageLimitReached
                        ? `Message limit reached. Start a new chat to continue.`
                        : userMessageCount >= Math.floor(maxUserMessagesPerChat * 0.8)
                            ? `${maxUserMessagesPerChat - userMessageCount} message${maxUserMessagesPerChat - userMessageCount !== 1 ? 's' : ''} remaining`
                            : userMessageCount >= Math.floor(maxUserMessagesPerChat / 2)
                                ? `${maxUserMessagesPerChat - userMessageCount} message${maxUserMessagesPerChat - userMessageCount !== 1 ? 's' : ''} remaining`
                                : `${maxUserMessagesPerChat - userMessageCount} message${maxUserMessagesPerChat - userMessageCount !== 1 ? 's' : ''} remaining`
                }
            >
                <span>{userMessageCount}/{maxUserMessagesPerChat}</span>
                {isMessageLimitReached && (
                    <span className="text-red-400">•</span>
                )}
                {userMessageCount >= Math.floor(maxUserMessagesPerChat * 0.8) && !isMessageLimitReached && (
                    <span className="text-red-400">!</span>
                )}
                {userMessageCount >= Math.floor(maxUserMessagesPerChat / 2) && userMessageCount < Math.floor(maxUserMessagesPerChat * 0.8) && (
                    <span className="text-red-400">•</span>
                )}
            </div>
        </div>
    )
}