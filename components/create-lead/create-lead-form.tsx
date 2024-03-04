'use client';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { TextArea } from '@/components/text-area';
import { FormItems } from '@/models/global-types';
import { UserService } from '@/services/user-services';
import { LeadService } from '@/services/lead-services';
import {
  CREATE_LEAD_STATUS_NEW,
  FORM_ITEMS,
  PAGE_ROUTES,
} from '@/utils/constants/common-constants';
import { leadFormErrorCheck } from '@/utils/helpers/common-helpers';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { CustomSelect } from '../select/custom-select';
import Map from './map';
import Dropzone from './multi-image-upload';
import { LeadsContext } from '@/context/leads-context';
import MiniLoader from '../mini-loader';

const CreateLeadForm: React.FC = () => {
  const [statusSelected, setStatusSelected] = useState('');
  const [assignedToSelected, setAssignedToSelected] = useState('');
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState<FormItems>(FORM_ITEMS);
  const [formErrors, setFormErrors] = useState<FormItems>(FORM_ITEMS);
  const [pending, setPending] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const [location, setLocation] = useState({
    lat: 22.04,
    lng: 30.0,
  });

  const router = useRouter();

  const { executivesOption, setExecutivesOption } = useContext(LeadsContext);

  const { data } = useSession();
  // @ts-ignore
  const token = data?.user?.access_token;

  const handlePendingChange = (isPending: boolean) => {
    setPending(isPending);
  };

  useEffect(() => {
    setFormData((prev) => {
      return { ...prev, Images: [...images] };
    });
  }, [images]);

  useEffect(() => {
    if (token) {
      const UserServices = new UserService();
      UserServices.getExecutivesData(setExecutivesOption, token, setIsLoading);
    }
  }, [token, setExecutivesOption]);

  useEffect(() => {
    setFormData((prev) => {
      return { ...prev, Status: statusSelected, AssignedTo: assignedToSelected };
    });

    if (statusSelected) {
      setFormErrors((prev) => {
        return { ...prev, Status: '' };
      });
    }
    if (assignedToSelected) {
      setFormErrors((prev) => {
        return { ...prev, AssignedTo: '' };
      });
    }
    setIsSuccess(false);
  }, [statusSelected, assignedToSelected]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      return { ...prev, [name]: value };
    });

    setFormErrors((prev) => {
      return { ...prev, [name]: '' };
    });
  };

  const onFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setFormData((prev) => {
      return { ...prev, location };
    });

    try {
      const newFormErrors: any = {};

      for (let field in formData) {
        if (leadFormErrorCheck(formData, field)) {
          newFormErrors[field] = leadFormErrorCheck(formData, field);
        }
      }

      setFormErrors(newFormErrors);

      if (Object.keys(newFormErrors).length === 0) {
        executivesOption.map((option: any) => {
          if (option.name === assignedToSelected) {
            setFormData((prev) => {
              return { ...prev, AssignedTo: option.name, ExecutiveId: option.id };
            });
          }
        });

        //! Payload object
        const payloadObj = {
          title: formData?.Title,
          executive_id: formData?.ExecutiveId,
          executive_name: formData?.AssignedTo,
          latitude: location?.lat,
          longitude: location?.lng,
          meeting_status: formData?.Status,

          point_of_contact: {
            name: formData?.Name,
            phone: formData?.Phone,
            email: formData?.Email,
            meeting_notes: formData?.Note,
            reference: formData?.Reference,
          },

          image_infos: [...images],
        };

        // @ts-ignore
        const token = data?.user?.access_token;

        const LeadServices = new LeadService();
        if (token) {
          const res = await LeadServices.createLead(payloadObj, token);
          if (res.status === 201) {
            setFormData(FORM_ITEMS);
            setStatusSelected('');
            setAssignedToSelected('');
            setImages([]);
            setIsSuccess(true);
            toast.success(res.data.Message);
            router.push(PAGE_ROUTES.Leads);
          }
        } else {
          toast.error('Something went wrong.');
        }
      }
    } catch (err: any) {
      toast.error(err.response.data.message);
    }
    setPending(false);
  };

  return (
    <div className='mt-2 p-6 overflow-y-auto h-[calc(100%-30px)] tiny-scrollbar'>
      <form onSubmit={onFormSubmit}>
        <div className='flex items-center justify-between gap-5'>
          <Input
            label='Title'
            placeholder='Title here'
            id='title'
            name='Title'
            disabled={pending}
            value={formData?.Title}
            onChange={handleInputChange}
          />

          <div className='flex flex-col justify-between gap-5 w-full mb-[21px]'>
            <CustomSelect
              label='AssignedTo'
              setSelected={setAssignedToSelected}
              options={executivesOption}
              errorMessage={formErrors.AssignedTo}
              className={`${formErrors.AssignedTo && '!border-red-500 !shadow'}`}
              isLoading={pending}
              selected={isSuccess ? '' : assignedToSelected}
            />
          </div>
        </div>

        <div className='flex items-center justify-between mt-2 gap-5'>
          <Input
            label='Name'
            placeholder='Name'
            id='name'
            name='Name'
            disabled={pending}
            value={formData?.Name}
            onChange={handleInputChange}
          />

          <Input
            label='Phone'
            placeholder='Phone number'
            id='phone'
            name='Phone'
            disabled={pending}
            value={formData?.Phone}
            onChange={handleInputChange}
          />
        </div>

        <div className='flex items-center justify-between mt-2 gap-5'>
          <Input
            label='Email'
            placeholder='Email (Optional)'
            type='email'
            id='email'
            name='Email'
            disabled={pending}
            value={formData?.Email}
            onChange={handleInputChange}
          />

          <Input
            label='Reference'
            placeholder='Reference (Optional)'
            id='reference'
            name='Reference'
            disabled={pending}
            value={formData?.Reference}
            onChange={handleInputChange}
          />
        </div>

        <div className='flex items-center justify-between mt-2 gap-5'>
          <div className='w-1/2'>
            <CustomSelect
              label='Status'
              setSelected={setStatusSelected}
              options={CREATE_LEAD_STATUS_NEW}
              errorMessage={formErrors.Status}
              className={`${formErrors.Status && 'border-red-500 shadow'}`}
              isLoading={pending}
              selected={isSuccess ? '' : statusSelected}
            />
            <div className='mt-5'>
              <Map setLocation={setLocation} location={location} />
            </div>
          </div>
          <div className='w-1/2'>
            <TextArea
              label='Remarks'
              placeholder='Notes'
              name='Note'
              disabled={pending}
              value={formData?.Note}
              errorMessage={formErrors.Note}
              className={`h-[200px] ${formErrors.Note && 'border-red-500 shadow'}`}
              onChange={handleInputChange}
            />
            <div className='items-start justify-center mt-5'>
              <p className='text-[rgb(0,21,106)] font-medium text-xs 2xl:text-sm mb-2'>
                Image
              </p>
              <Dropzone
                onChange={setImages}
                onPendingChange={handlePendingChange}
                isSuccess={isSuccess}
              />
            </div>
          </div>
        </div>

        <div className='flex justify-end  mt-5 gap-5 items-end'>
          <Button
            type='submit'
            disabled={pending}
            className={`md:w-[150px] lg:w-[193px] rounded-[10px] md:h-[35px] lg:h-[60px]`}>
            {pending ? <MiniLoader /> : ' Create'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateLeadForm;
