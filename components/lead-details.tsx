/* eslint-disable @next/next/no-img-element */
'use client';

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import moment from 'moment';
import Reminder from './reminder';
import CreateRemainderModal from './create-remainder-modal';
import { Button } from './button';
import { AssignDropdownSelect } from './assign-dropdown-select';
import { CREATE_REMINDER_ITEMS } from '@/utils/constants/common-constants';
import clockImage from '@/assets/images/leadslist-icons/clock.png';
import crossImage from '@/assets/images/leadslist-icons/close-circle.png';
import flagImage from '@/assets/images/leadslist-icons/triangle-flag.png';
import { CreateReminderItems, RemainderType, statusColor } from '@/models/global-types';
import { validateImageUrl } from '@/utils/helpers/common-helpers';
import { ReminderService } from '@/services/reminder-services';
import MiniLoader from './mini-loader';

const getStatusColor: statusColor = {
  cold: 'bg-blue-200',
  hot: 'bg-[#FFD9D9]',
  warm: 'bg-[#FFEFB8]',
};

const LeadDetails = ({
  setIsOpen,
  data,
  isOpen,
}: {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  data: any;
  isOpen: boolean;
}) => {
  const [selected, setSelected] = useState('');
  const [formData, setFormData] = useState<CreateReminderItems>(CREATE_REMINDER_ITEMS);
  const [formErrors, setFormErrors] =
    useState<CreateReminderItems>(CREATE_REMINDER_ITEMS);
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const [closeDrawer, setCloseDrawer] = React.useState(false);
  const [reminders, setReminders] = React.useState<RemainderType[]>();
  const [isCreated, setIsCreated] = React.useState(false);
  const [isUpdated, setIsUpdated] = React.useState(false);
  const { data: reminderData } = useSession();
  //@ts-ignore den
  const token: string = reminderData?.user?.access_token;

  const handleAddReminderButtonClick = () => {
    setModalIsOpen(true);
  };

  // const handleChange = (selectedOption: any) => {
  //   setSelectReminder(selectedOption.value);
  // };

  // To get data initially
  useEffect(() => {
    const Service = new ReminderService();
    isOpen && Service.getAllRemindersData(token, setReminders);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, token]);

  // To get the latest remainder after creating new remainder
  useEffect(() => {
    const Service = new ReminderService();
    (isCreated || isUpdated) && Service.getAllRemindersData(token, setReminders);
    setIsCreated(false);
    setIsUpdated(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreated, isUpdated]);

  useEffect(() => {
    setIsOpen(false);
  }, [closeDrawer, setIsOpen]);

  return (
    <div className='p-8 h-full overflow-y-auto no-scrollbar'>
      <div className='flex justify-between '>
        <h2 className='text-[20px] font-semibold mb-4 text-[#25254C]'>Details</h2>
        <div onClick={() => setCloseDrawer(!closeDrawer)} className='cursor-pointer'>
          <Image src={crossImage} alt='close' />
        </div>
      </div>

      <h4 className='text-[#00156A] font-medium text-[12px] mb-[19px]'>Location</h4>

      <div className='flex items-center justify-between gap-4'>
        <div className='flex justify-between items-center gap-1'>
          <div>
            <Image src={flagImage} alt='location' />
          </div>
          <div>{data?.latitude}</div>
        </div>
        {/* <button className='text-[#5630FF]'>Change</button> */}
      </div>

      <div className='desc'>
        <div className='flex items-center gap-4 mt-3'>
          <div className='flex-grow break-all'>{data?.title}</div>
          <div
            className={`flex justify-between gap-2 px-2 py-[10px] rounded-xl items-center
                ${
                  getStatusColor[data?.meeting_status as keyof statusColor]
                } cursor-pointer`}>
            <button className='text-black text-sm font-medium'>
              {data?.meeting_status}
            </button>
          </div>
        </div>
        <div className='flex items-center'>
          <div className='mr-1'>
            <Image src={clockImage} alt='' />
          </div>
          <div className='text-gray-400 text-xs whitespace-nowrap text-capitalize inline-block'>
            {moment(data?.created_at).format('ddd DD MMM, YYYY hh:mm A')}
          </div>
        </div>
        <AssignDropdownSelect leadData={data} />
      </div>

      <div className='poc border-[#EDEBF4] bg-[#F8F8F8] p-4 rounded-lg mt-4 whitespace-normal'>
        <h4 className='text-[#5630FF] font-medium mb-2 text-[12px] leading-[14px]'>
          Points of Contacts
        </h4>

        <div className='rounded-lg bg-white mb-4 p-4'>
          <div className='text-[#5630FF] mb-2 text-[12px] font-medium leading-[14px]'>
            Name
          </div>
          <div className='font-semibold leading-[14px] text-black text-[16px]'>
            {data?.point_of_contact?.name}
          </div>
        </div>

        {data?.point_of_contact?.phone && (
          <div className='rounded-lg bg-white mb-4 p-4'>
            <div className='text-[#5630FF] mb-2 text-[12px] font-medium leading-[14px]'>
              Phone
            </div>
            <div className='font-semibold leading-[14px] text-black text-[16px]'>
              {data?.point_of_contact?.phone}
            </div>
          </div>
        )}

        {data?.point_of_contact?.email && (
          <div className='rounded-lg bg-white mb-4 p-4'>
            <div className='text-[#5630FF] mb-2 text-[12px] font-medium leading-[14px]'>
              Email
            </div>
            <div className='font-semibold leading-[14px] text-black text-[16px]'>
              {data?.point_of_contact?.email}
            </div>
          </div>
        )}

        {data?.point_of_contact?.reference && (
          <div className='rounded-lg bg-white mb-4 p-4'>
            <div className='text-[#5630FF] mb-2 text-[12px] font-medium leading-[14px]'>
              Reference
            </div>
            <div className='font-semibold leading-[14px] text-black text-[16px]'>
              {data?.point_of_contact?.reference}
            </div>
          </div>
        )}

        {data?.point_of_contact?.meeting_notes && (
          <div className='rounded-lg bg-white p-4'>
            <div className='text-[#5630FF] mb-2 text-[12px] font-medium leading-[14px]'>
              Meeting notes
            </div>
            <p className='font-semibold leading-[14px] text-black text-[16px]'>
              {data?.point_of_contact?.meeting_notes}
            </p>
          </div>
        )}
      </div>

      {!!data?.image_info_json?.length && (
        <div>
          <h4 className='text-[#00156A] font-medium text-[12px] leading-[14px] mt-5'>
            Image
          </h4>
          <div className='flex flex-wrap gap-2 mx-auto mt-5'>
            {data?.image_info_json?.map((image: any) => (
              <div key={image?.image_name}>
                <Image
                  src={`${image?.image_path}`}
                  alt='image'
                  width={100}
                  height={100}
                  className={`w-[108px] h-[108px]`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className=' bg-[#F8F6FF] p-4 rounded-lg whitespace-normal mt-5'>
        <h1 className='text-[#5630FF] font-medium leading-[14px] mb-[10px] text-[12px]'>
          Reminder
        </h1>

        {!reminders ? (
          <MiniLoader />
        ) : reminders?.filter((item) => item?.lead_id === data?.id)?.length === 0 ? (
          <div className='text-center'>No reminder</div>
        ) : (
          <div className='max-h-[236px] overflow-y-auto tiny-scrollbar flex flex-col gap-4'>
            {reminders
              ?.filter((item) => item?.lead_id === data?.id)
              ?.map((reminder: RemainderType) => (
                <Reminder
                  key={reminder?.id}
                  reminder={reminder}
                  token={token}
                  setReminders={setReminders}
                  isUpdated={isUpdated}
                  setIsUpdated={setIsUpdated}
                />
              ))}
          </div>
        )}
      </div>

      <div className='flex justify-center items-center'>
        <Button
          onClick={handleAddReminderButtonClick}
          className='text-white text-[14px] rounded-[10px] font-semibold leading-[14px] w-[183px] h-[50px] my-8 transition duration-500 ease-in-out transform hover:-translate-y-1.5 hover:scale-200'>
          Add Reminder
        </Button>
      </div>
      <CreateRemainderModal
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        selected={selected}
        setSelected={setSelected}
        leadsData={data}
        setIsCreated={setIsCreated}
      />
    </div>
  );
};

export default LeadDetails;
