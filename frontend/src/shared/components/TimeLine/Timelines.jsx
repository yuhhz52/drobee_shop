import React from 'react'
import { useTranslation } from '@shared/i18n/useTranslation.js';

const Timelines = ({stepCount}) => {
    const { t } = useTranslation();
    return (
        <div className='w-full flex justify-center mb-4'>
            <ol className="items-center sm:flex">
                <li className="relative mb-6 sm:mb-0">
                    <div className="flex items-center">
                        <div className={`z-10 flex items-center justify-center w-6 h-6 rounded-full ring-0 ring-white shrink-0 bg-gray-500`}>
                        </div>
                        <div className={`hidden sm:flex w-full h-0.5 ${stepCount>=2 ? 'bg-gray-500':'bg-gray-300'}`}></div>
                    </div>
                    <div className="mt-3 sm:pe-8">
                        <h3 className="text-sm font-semibold text-gray-900">{t('timeline.orderPlaced')}</h3>
                    </div>
                </li>
                <li className="relative mb-6 sm:mb-0">
                    <div className="flex items-center">
                        <div className={`z-10 flex items-center justify-center w-6 h-6 rounded-full ring-0 ring-white shrink-0 bg-gray-300 ${stepCount >=2 ? 'bg-gray-500':'bg-gray-200'}`}>
                        </div>
                        <div className={`hidden sm:flex w-full h-0.5 ${stepCount>=3 ? 'bg-gray-500':'bg-gray-300'}`}></div>
                    </div>
                    <div className="mt-3 sm:pe-8">
                        <h3 className="text-sm font-semibold text-gray-900">{t('timeline.inProgress')}</h3>
                    </div>
                </li>
                <li className="relative mb-6 sm:mb-0">
                    <div className="flex items-center">
                        <div className={`z-10 flex items-center justify-center w-6 h-6 rounded-full ring-0 ring-white shrink-0 bg-gray-300 ${stepCount >=3 ? 'bg-gray-500':'bg-gray-200'}`}>
                        </div>
                        <div className={`hidden sm:flex w-full h-0.5 ${stepCount>=4 ? 'bg-gray-500':'bg-gray-300'}`}></div>
                    </div>
                    <div className="mt-3 sm:pe-8">
                        <h3 className="text-sm font-semibold text-gray-900">{t('timeline.shipped')}</h3>
                    </div>
                </li>
                <li className="relative mb-6 sm:mb-0">
                    <div className="flex items-center">
                        <div className={`z-10 flex items-center justify-center w-6 h-6 rounded-full ring-0 ring-white shrink-0 bg-gray-300 ${stepCount >=4 ? 'bg-gray-500':'bg-gray-200'}`}>
                        </div>

                    </div>
                    <div className="mt-3 sm:pe-8">
                        <h3 className="text-sm font-semibold text-gray-900">{t('timeline.delivered')}</h3>
                    </div>
                </li>
            </ol>
        </div>
    )
}

export default Timelines
