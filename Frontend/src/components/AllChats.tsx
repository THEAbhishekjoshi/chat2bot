import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setSessionId } from '@/features/globalstate/sessionState'
import { fetchAllSessions } from '@/features/sessions/sessions'
import { useEffect } from 'react'

const AllChats = ({ searchText }: { searchText: string }) => {
    const userId = localStorage.getItem("userId") ?? sessionStorage.getItem("userId") ?? ""
    const dispatch = useAppDispatch()

    const currentSession = useAppSelector((state) => state.globalState.currentSessionId)

    useEffect(() => {
        dispatch(fetchAllSessions({ userId, searchText }))
    }, [userId, searchText])

    const { sessions, loading, error } = useAppSelector(
        (state) => state.sessions
    )

    const handleSessionId = ({ sessionId }: { sessionId: string }) => {
        dispatch(setSessionId(sessionId))
    }


    if (error) {
        return (
            <div className="text-red-500 text-center p-4">
                {error}
            </div>
        );
    }

    return (
    
        <div className="w-full h-full">
        {loading ? (
             <div className="flex p-4  w-full h-full items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
            </div>
        ) : !sessions.length ? (
            <div className="text-center text-[#ABABAB] p-4">
                No chats found
            </div>
        ) : (
            <div className="flex flex-col gap-2">
                  {sessions.map((s) => {
                return <div className={`${currentSession === s.sessionId ? 'bg-[#0f1011]' : 'bg-[#292a2e]'} w-full flex flex-col gap-2 hover:bg-[#1E1F22] p-5 rounded-md`} onClick={() => handleSessionId({ sessionId: s.sessionId })} key={s.sessionId}>
                    {/* title */}
                    <div className='flex justify-between gap-8'>
                        <div className='text-sm font-bold'>{s.title}</div>
                        <div className='text-[0.7rem] text-[#ABABAB]'>{new Date(s.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                        })}</div>
                    </div>
                    <div className='break-words text-[#ABABAB] text-[0.8rem]'>
                        {s.lastMessage?.length ? s.lastMessage.slice(0, 50) : "No message yet"}...
                    </div>
                </div>
            })}
            </div>
        )}
    </div>
    )
}

export default AllChats
