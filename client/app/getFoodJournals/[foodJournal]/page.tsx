'use client';
import Image from 'next/image';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Link from 'next/link';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { getFoodIntakeJournal, getFoodIntakeJournals} from '../../http/foodJournalAPI'; 
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';
import Menu from '@/app/components/Menu';
import { formatDate, formatMilitaryTime } from '@/app/helpers/utils/datetimeformat';
import Custom403 from '@/app/pages/403';


export default function GetFoodJournal({params: { foodJournal } } : { params: { foodJournal: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const { userInfo } = useUser();
  const [food, setfood] = useState<any>(null);
  
  async function fetchFoodJournal() {
    try {
      const userId = user?.uid || '';
      const result = await getFoodIntakeJournal(foodJournal);
      console.log('Food journal entry retrieved:', result);
      setfood(result.data);
    } catch (error) {
      console.error('Error retrieving Food journal entry:', error);
    }
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks  
  useEffect(() => {
    if (!user) {
      router.push("/login")
      alert('User not found.');
    } 
    if (user) {
      fetchFoodJournal();
    }
  }, []);

  if (!user) {
    return <div><Custom403/></div>
  }

  return (
    <div className="bg-eggshell min-h-screen flex flex-col">
       <span className="flex items-baseline font-bold text-darkgrey text-[24px] mx-4 mt-4 mb-4">
              <button onClick={() => router.push('/getFoodJournals')}>
              <Header headerText="View the Food Journal"></Header>
              </button>
              </span>
     
        {food && (
     <span
     className="rounded-2xl  mt-6 mb-10 mr-28 bg-white flex flex-col m-auto w-full md:max-w-[800px] md:min-h-[600px] p-8 shadow-[0_32px_64px_0_rgba(44,39,56,0.08),0_16px_32px_0_rgba(44,39,56,0.04)]"
   >
     <div className="mt-3 relative">
     <div>
     <div className="flex items-center">
  <p className="text-lg ml-0 font-sans text-darkgrey font-bold text-[16px]" style={{ display: 'inline' }}>
    Date: 
  </p>
  <p className="text-md ml-2 text-darkgrey">
  {formatDate(food.date)}
  </p>
</div>
       <p
           className="text-lg ml-0 font-sans text-darkgrey  font-bold text-[16px]"
           style={{display: 'inline'}}
       >
         Time:
       </p>
       <p
           className="text-md ml-2 text-darkgrey"
           style={{display: 'inline'}}
       >
         {/* {new Date(`1970-01-01T${food.time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} */}
         {formatMilitaryTime(food.time)}
       </p>
       <br></br>
       <p
           className="text-lg ml-0 font-sans text-darkgrey  font-bold text-[16px]"
           style={{display: 'inline'}}
       >
         Name of Food:
       </p>
       <p
           className="text-md ml-2 text-darkgrey"
           style={{display: 'inline'}}
       >
         {food.foodName}
       </p>
       <br></br>
       <p
           className="text-lg ml-0 font-sans text-darkgrey  font-bold text-[16px]"
           style={{display: 'inline'}}
       >
          Meal Type:
       </p>
       <p
           className="text-md ml-2 text-darkgrey"
           style={{display: 'inline'}}
       >
        {food.mealType}
       </p>
       <br></br>

       <p
           className="text-lg ml-0 font-sans text-darkgrey font-bold text-[16px]"
           style={{display: 'inline'}}
       >
         Number of Servings:
       </p>
       <p
           className="text-md ml-2 text-darkgrey"
           style={{display: 'inline'}}
       >
         {food.servingNumber}
       </p>

       <br></br>
       <p
           className="text-lg ml-0 font-sans text-darkgrey  font-bold text-[16px]"
           style={{display: 'inline'}}
       >
         Notes:
       </p>
       <p
           className="text-md ml-2 text-darkgrey"
           style={{display: 'inline'}}
       >
         {food.notes}
       </p>
       <br></br>
     </div>
   </div>
    <div className='mt-10 pb-4 self-center'>
    <Button type="button" text="Edit"style={{ width: '140px' }} onClick={() => router.push(`/getFoodJournals/${foodJournal}/${foodJournal}`)} />
    <Button
    type="button"
    text="Cancel"
    style={{ width: '140px', backgroundColor: 'var(--Red, #FF7171)',marginLeft:'12px' }}
    onClick={() => router.push(`/getFoodJournals`)}
    />
    </div>
      </span>
)}
    </div>
  );
}