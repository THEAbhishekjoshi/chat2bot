import ChatBot from './ChatBot'
const Message = () => {
    return (
        <div className='ml-3 pb-3 mr-3 w-full min-w-0  h-full flex flex-col p-1 overflow-hidden' >

            {/* TopBar */}
            <div className='flex justify-between text-white h-8 w-full'>
                {/* title */}
                <div className='font-semibold text-2xl'>Messages</div>

            </div>

            {/* Main content */}
            <div className='mt-2 flex-1 min-h-0 min-w-0 h-full w-full bg-[#3F424A] rounded-md overflow-y-auto relative chat-messages'>
                <ChatBot />
            </div>
        </div>
    )
}

export default Message