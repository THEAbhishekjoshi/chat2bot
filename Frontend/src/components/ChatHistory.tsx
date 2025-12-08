import React from 'react'
import { Plus, Ellipsis } from "lucide-react";
import Tab from './common/Tab';
import SearchWithFilter from './common/Searchbar';

const ChatHistory = () => {
    return (
        <div className='w-full h-full p-2 relative flex flex-col gap-4'>
            {/* Top bar */}
            <div className='flex justify-between'>

                {/* Title */}
                <div className='font-semibold text-white text-2xl'>My Chats</div>



                <div className='flex gap-2'>
                    <div className='bg-[#15c37a] text-white rounded-md flex items-center justify-center w-[1.8rem] h-[1.8rem]'><Plus size={18}/></div>
                    <div className='bg-[#1E1F22] text-white rounded-md flex items-center justify-center w-[1.8rem] h-[1.8rem]'><Ellipsis /></div>
                </div>
            </div>

            {/* Toggle button */}
            <div className=''>
                <Tab props={["Chats","Saved"]} design='w-full h-[3rem] text-[#15c37a] bg-[#575B65] ' defaultTab='Chats'/>
            </div>

            {/* Search bar with filter */}
            <div className=''>
                <SearchWithFilter/>
            </div>

            {/* All Chats */}
            <div className='bg-slate-500  mt-2 rounded-md text-white flex items-center justify-center'>
                
            </div>
        </div>
    )
}

export default ChatHistory