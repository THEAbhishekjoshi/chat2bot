import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setSessionId } from '@/features/globalstate/sessionState'
import { fetchAllSessions, type sessionProps } from '@/features/sessions/sessions'
import { useEffect, useState } from 'react'

const AllChats = () => {
    const userId = "100001"
    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(fetchAllSessions({ userId }))
    }, [])

    const sessionList = useAppSelector((state) => state.sessions)

    const handleSessionId=({sessionId}:{sessionId:string})=>{
        dispatch(setSessionId(sessionId))
    }
    return (
        <div className='w-full flex flex-col gap-2 ' >
            {sessionList.map((s) => {
                console.log(s,"s 22")
                return <div className='w-70 flex flex-col gap-2 hover:bg-[#1E1F22] p-5 rounded-md' onClick={()=>handleSessionId({sessionId:s.sessionId})} key={s.sessionId}>
                    {/* title */}
                    <div className='flex justify-between gap-8'>
                        <div className='text-sm'>{s.title}</div>
                        <div className='text-sm'>{new Date(s.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                        })}</div>
                    </div>
                    <div className='break-words'>
                        {s.lastMessage?.length ? s.lastMessage.slice(0,80) : "No message yet"}...
                    </div>
                </div>
            })}
        </div>
    )
}

export default AllChats