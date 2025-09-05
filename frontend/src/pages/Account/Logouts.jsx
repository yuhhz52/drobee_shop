
import { logoutAPI } from '../../api/authencation';

const Logouts = () => {
  const onLogOut = async () => {
    await logoutAPI();
  };

  return (
    <button
      onClick={onLogOut}
      className='w-[150px] h-[48px] bg-black text-white rounded-lg hover:bg-gray-800'
    >
      Logout
    </button>
  );
};

export default Logouts;
