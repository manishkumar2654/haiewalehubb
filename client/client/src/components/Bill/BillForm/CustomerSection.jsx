const CustomerSection = ({ data, onChange, errors = {} }) => {
  const handleChange = (e) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="grid grid-cols-1 bg-slate-100 p-6 rounded-xl md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <label className="block text-xl leading-normal font-bold font-['Philosopher'] text-black">
          Name
        </label>
        <input
          name="name"
          value={data.name}
          onChange={handleChange}
          className={`self-stretch h-14 pr-4 w-full px-2 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-black/50 inline-flex justify-between items-center text-black text-base font-normal font-['Poppins'] ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter customer name"
          required
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-xl leading-normal font-bold font-['Philosopher'] text-black">
          Customer ID
        </label>
        <input
          name="customerId"
          value={data.customerId}
          onChange={handleChange}
          className={`self-stretch h-14 pr-4 w-full px-2 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-black/50 inline-flex justify-between items-center text-black text-base font-normal font-['Poppins'] ${
            errors.customerId ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="1020304050"
          required
        />
        {errors.customerId && (
          <p className="text-red-500 text-xs mt-1">{errors.customerId}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-xl leading-normal font-bold font-['Philosopher'] text-black">
          Phone
        </label>
        <input
          name="phone"
          value={data.phone}
          onChange={handleChange}
          className={`self-stretch h-14 pr-4 w-full px-2 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-black/50 inline-flex justify-between items-center text-black text-base font-normal font-['Poppins'] ${
            errors.phone ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="+91 7828660210"
          required
        />
        {errors.phone && (
          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-xl leading-normal font-bold font-['Philosopher'] text-black">
          Gender
        </label>
        <select
          name="gender"
          value={data.gender}
          onChange={handleChange}
          className="self-stretch h-14 pr-4 w-full px-2 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-black/50 inline-flex justify-between items-center text-black text-base font-normal font-['Poppins']"
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-xl leading-normal font-bold font-['Philosopher'] text-black">
          Date
        </label>
        <input
          type="date"
          name="date"
          value={data.date}
          onChange={handleChange}
          className="self-stretch h-14 pr-4 w-full px-2 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-black/50 inline-flex justify-between items-center text-black text-base font-normal font-['Poppins']"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xl leading-normal font-bold font-['Philosopher'] text-black">
          Room No.
        </label>
        <input
          name="roomNo"
          value={data.roomNo}
          onChange={handleChange}
          className="self-stretch h-14 pr-4 w-full px-2 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-black/50 inline-flex justify-between items-center text-black text-base font-normal font-['Poppins']"
          placeholder="101"
        />
      </div>
    </div>
  );
};

export default CustomerSection;
