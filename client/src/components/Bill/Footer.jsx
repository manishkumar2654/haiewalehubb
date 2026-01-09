import { MapPin } from "lucide-react";

const footer = () => {
  return (
    <div className="bg-white relative">
      <div className="w-full h-43 bg-[url('/bill/footerbg.png')] bg-cover bg-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-center items-center">
          <MapPin className="mt-20" />{" "}
          <span className="ml-2 mt-20 max-h-6 justify-center text-black text-xl font-bold font-['Poppins'] leading-snug">
            House No.36, Sec. F-B, Scheme No. 94, Indore
          </span>
        </div>
      </div>
    </div>
  );
};
export default footer;
