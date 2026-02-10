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
                    ? 'bg-[#1072f8]/20 text-[#3b8fff]'
                    : userMessageCount >= Math.floor(maxUserMessagesPerChat * 0.8)
                        ? 'bg-[#1072f8]/20 text-[#3b8fff]'
                        : userMessageCount >= Math.floor(maxUserMessagesPerChat / 2)
                            ? 'bg-[#1072f8]/10 text-[#3b8fff]'
                            : 'bg-[#1a1a1a] text-gray-400'
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
                    <span className="text-[#3b8fff]">•</span>
                )}
                {userMessageCount >= Math.floor(maxUserMessagesPerChat * 0.8) && !isMessageLimitReached && (
                    <span className="text-[#3b8fff]">!</span>
                )}
                {userMessageCount >= Math.floor(maxUserMessagesPerChat / 2) && userMessageCount < Math.floor(maxUserMessagesPerChat * 0.8) && (
                    <span className="text-[#3b8fff]">•</span>
                )}
            </div>
        </div>
    )
}