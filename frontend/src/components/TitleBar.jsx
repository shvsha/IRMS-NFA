import '../styles/TitleBar.css'
import NFALogo from '../assets/NFA-logo.png'

// react
import { useNavigate } from 'react-router-dom'

// shadcn components
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

// util
import { cn } from "@/lib/utils"

// axios
import api from '../api/axios'

export default function TitleBar() {
  // US
  const navigate = useNavigate();

  // custom function
  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      await api.post('api/auth/logout', {refresh});
    } catch (err) {
      console.log('Logout error: ', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      navigate('/');
    }
  }
  
  return (
    <>
      <div className='flex justify-between w-full text-center text-white title-bar-grad p-2 items-center'>
        <div className='flex items-center py2.5 px-4'>
          <img className='h-22.5 max-w-22.5' src={NFALogo} alt="" />
          <p className='text-2xl font-semibold ml-4 italic'>Integrated Report Monitoring System</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger className='flex items-center justify-center pr-7.5 '  asChild>
            <Button  className='bg-transparent rounded-8 text-white py-2.5 px-7.5 border-white border font-bold text-17 italic mr-4 '>Logout</Button>
          </AlertDialogTrigger>

          <AlertDialogContent className='pt-0 px-0 bg-[#E6EEF6] pb-0'>
            <div className='h-7 bg-[#2D317F] rounded-t-lg'></div>
            <AlertDialogHeader className='p-5 text-center items-center pb-4'>
              <AlertDialogTitle className='font-bold text-[#2D317F] text-3xl'>Logout</AlertDialogTitle>
              <AlertDialogDescription className={cn('!text-customSize', 'text-gray-600')}>
                Are you sure you want to logout?
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className='mx-0 mb-0 bg-transparent flex flex-row justify-center gap-3 border-[#a2aab3]'>
              <AlertDialogCancel className=' px-5 py-4.5'>Cancel</AlertDialogCancel>
              <AlertDialogAction className='!bg-[#2D317F] text-white hover:bg-[#1a1f4d] px-5 py-4.5' onClick={handleLogout}>Logout</AlertDialogAction>
            </AlertDialogFooter>

          </AlertDialogContent>
        </AlertDialog>

      </div>
    </>
  )
}