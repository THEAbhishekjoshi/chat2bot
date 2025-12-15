import Sidebar from '@/components/common/Iconbutton'
import Message from '@/components/Message'
import React from 'react'

const ChatBotFriend = () => {
  return (
    <div className='bg-[#282A2E] flex h-dvh w-dvw'>
        <Sidebar/>
        <Message/>
    </div>
  )
}

export default ChatBotFriend