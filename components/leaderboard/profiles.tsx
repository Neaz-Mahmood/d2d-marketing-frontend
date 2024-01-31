import { Person } from '@/models/global-types';
import React from 'react';
import {generateInitials} from '@/utils/helpers/common-helpers'


const Profiles = ({ data }: { data: Person[] | null }) => {
  return (
    <div className='h-[calc(100%-70px)] overflow-y-auto tiny-scrollbar px-5'>
      {data?.map((person: Person) => (
        <div
          key={person?.executive_id}
          className='grid grid-cols-4 justify-center items-center gap-5 mb-5'>
          <div className='bg-[#E5DFFF] p-[13px] rounded-2xl font-semibold text-[#b8a9ff] text-[16px]'>
            {generateInitials(person?.executive_name)}
          </div>
          {/* width based on name length */}
          <div className='col-span-2'>
            <div className=' font-semibold text-[#00156a] text-[16px]'>
              {person?.executive_name}
            </div>
            <p className='text-[13px]  text-[#9aa1b1]'>
              <span className='font-bold text-[#5630ff]  mr-1'>
                {person?.count_of_leads}
              </span>
              of leads
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Profiles;
