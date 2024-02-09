'use client';

import { DeleteModalProps } from '@/models/global-types';
import { Button } from './button';
import './dropdown-select.css';
import React from 'react';
import Modal from 'react-modal';
import 'react-datetime/css/react-datetime.css';
import { DeleteLeadModalImage, ExIcon } from '@/assets/icons';
import { useSession } from 'next-auth/react';
import { LeadService } from '@/services/lead-services';
import { toast } from 'react-toastify';
import { ReminderService } from '@/services/reminder-services';

if (Modal.defaultStyles.overlay) {
  Modal.defaultStyles.overlay.backgroundColor = '#00000054';
}

const ConfirmationModal = ({
  modalIsOpen,
  setModalIsOpen = () => {},
  setRemainders,
  data,
  token,
}: any) => {
  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleConfirmButton = async () => {
    const Service = new ReminderService();
    const res = await Service.deleteReminder(data?.id, token);

    if (res?.status === 202) {
      toast.success('Successfully deleted!');
      Service.getAllRemindersData(token, setRemainders);
    } else {
      toast.error('Failed to delete!');
    }
    setModalIsOpen(false);
  };

  return (
    <Modal
      className={
        'absolute w-[404px] h-auto  -translate-x-2/4 -translate-y-2/4 left-[50%] right-[auto] top-[50%] bottom-[auto]'
      }
      isOpen={modalIsOpen}
      onRequestClose={closeModal}>
      <div className='m-[30px]'>
        <button onClick={closeModal} className='pl-[250px] mb-[10px]'>
          <ExIcon />
        </button>

        <div className='flex justify-center items-center flex-col'>
          <DeleteLeadModalImage />
          <p className='mt-[10px] font-semibold text-[#131212] text-[20px] text-center leading-[31.2px]'>
            Are you sure you want to Delete?
          </p>
        </div>

        <div className='mt-[16px] flex gap-[12px]'>
          <Button
            onClick={closeModal}
            className='w-[135px] px-[51] py-[18px] flex justify-center items-center rounded-[10px] !font-semibold text-white text-[18px] tracking-[0] leading-[14.5px] ease-in-out transform hover:-translate-y-0.5 hover:scale-200'>
            Cancel
          </Button>

          <Button
            onClick={handleConfirmButton}
            className='w-[135px] px-[51] py-[18px] flex justify-center items-center rounded-[10px] !font-semibold text-white text-[18px] tracking-[0] leading-[14.5px] ease-in-out transform hover:-translate-y-0.5 hover:scale-200'>
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
