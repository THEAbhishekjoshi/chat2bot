import React from 'react'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Bookmark, MessageCircle } from 'lucide-react'

export interface tabProps {
    props: string[],
    design?: string,
    defaultTab: string
}
const Tab = ({ props, design, defaultTab }: tabProps) => {
    return (
        <div>
            <Tabs defaultValue={defaultTab}>
                <TabsList className={design} >
                    {props.map((v) => {
                        return <TabsTrigger value={v} key={v} className='
                        data-[state=active]:bg-[#1f2124]
                                    data-[state=active]:text-[#15c37a]
                                    text-white
                                    uppercase
                                    text-[0.8rem]
                                    '>  {v == "Chats" ?
                                <div className='flex gap-2'>
                                    <MessageCircle />
                                    CHATS
                                    
                                </div>
                                :
                                <div className='flex gap-2'>
                                    <Bookmark />
                                    SAVED
                                </div>
                            }
                        </TabsTrigger>
                    })
                    }
                </TabsList>
            </Tabs>

        </div>
    )
}

export default Tab