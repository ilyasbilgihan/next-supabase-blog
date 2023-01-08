import { PuffLoader } from 'react-spinners';

export default function Loader() {
  return (
    <div className="absolute inset-0 backdrop-saturate-150 bg-white bg-opacity-10 backdrop-blur-sm grid place-items-center">
      {' '}
      <PuffLoader color="#0070f3" size={80} />
    </div>
  );
}
