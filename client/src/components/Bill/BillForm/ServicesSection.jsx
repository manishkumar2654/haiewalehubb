import { Plus, Trash2 } from "lucide-react";

const ServicesSection = ({ services, onChange }) => {
  const addService = () => {
    onChange([
      ...services,
      {
        serviceName: "",
        duration: "60 Min",
        staffAssigned: "",
        price: 0,
        gst: 5,
        discount: 5,
        total: 0,
      },
    ]);
  };

  const updateService = (index, field, value) => {
    const updated = [...services];
    updated[index][field] = value;

    if (["price", "gst", "discount"].includes(field)) {
      updated[index].total = calculateServiceTotal(updated[index]);
    }

    onChange(updated);
  };

  const calculateServiceTotal = (service) => {
    return (
      service.price * (1 + service.gst / 100) * (1 - service.discount / 100)
    );
  };

  return (
    <div className="space-y-4 ">
      <div className="overflow-x-auto ">
        <table className="w-full border-collapse  ">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="justify-start text-stone-900 text-base font-bold  font-['Philosopher'] leading-normal">
                Service Name
              </th>
              <th className="justify-start text-stone-900 text-base font-bold gap-2 font-['Philosopher'] leading-normal">
                Duration
              </th>
              <th className="justify-start text-stone-900 text-base font-bold gap-2 font-['Philosopher'] leading-normal">
                Staff Assigned
              </th>
              <th className="justify-start text-stone-900 text-base font-bold gap-2 font-['Philosopher'] leading-normal">
                Price
              </th>
              <th className="justify-start text-stone-900 text-base font-bold gap-2 font-['Philosopher'] leading-normal">
                GST
              </th>
              <th className="justify-start text-stone-900 text-base font-bold gap-2 font-['Philosopher'] leading-normal">
                Discount
              </th>
              <th className="justify-start text-stone-900 text-base font-bold gap-2 font-['Philosopher'] leading-normal">
                Total
              </th>
              <th className="justify-start text-stone-900 text-base font-bold gap-2 font-['Philosopher'] leading-normal">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, index) => (
              <tr key={index} className="border-b border-red-200">
                <td className="self-stretch pl-2.5 pr-6 py-4 bg-white  justify-start items-center ">
                  <input
                    type="text"
                    value={service.serviceName}
                    onChange={(e) =>
                      updateService(index, "serviceName", e.target.value)
                    }
                    className="justify-start text-stone-900 text-sm font-medium font-['Inter'] leading-tight"
                    placeholder="Facial"
                    required
                  />
                </td>
                <td className="self-stretch pl-2.5 pr-6 py-4 bg-white  justify-start items-center ">
                  <select
                    value={service.duration}
                    onChange={(e) =>
                      updateService(index, "duration", e.target.value)
                    }
                    className="justify-start text-gray-500 text-sm font-normal font-['Poppins'] leading-tigh"
                  >
                    <option value="30 Min">30 Min</option>
                    <option value="45 Min">45 Min</option>
                    <option value="60 Min">60 Min</option>
                  </select>
                </td>
                <td className="self-stretch pl-2.5 pr-6 py-4 bg-white  justify-start items-center ">
                  <input
                    type="text"
                    value={service.staffAssigned}
                    onChange={(e) =>
                      updateService(index, "staffAssigned", e.target.value)
                    }
                    className="justify-start text-stone-900 text-sm font-medium font-['Inter'] leading-tight"
                    placeholder="Riya"
                    required
                  />
                </td>
                <td className="self-stretch pl-2.5 pr-6 py-4 bg-white  justify-start items-center ">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={service.price}
                    onChange={(e) =>
                      updateService(index, "price", parseFloat(e.target.value))
                    }
                    className="justify-start text-stone-900 text-sm font-medium font-['Inter'] leading-tight"
                    required
                  />
                </td>
                <td className="self-stretch pl-2.5 pr-6 py-4 bg-white  justify-start items-center ">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={service.gst}
                    onChange={(e) =>
                      updateService(index, "gst", parseFloat(e.target.value))
                    }
                    className="justify-start text-stone-900 text-sm font-medium font-['Inter'] leading-tight"
                    required
                  />
                </td>
                <td className="self-stretch pl-2.5 pr-6 py-4 bg-white  justify-start items-center ">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={service.discount}
                    onChange={(e) =>
                      updateService(
                        index,
                        "discount",
                        parseFloat(e.target.value)
                      )
                    }
                    className="justify-start text-stone-900 text-sm font-medium font-['Inter'] leading-tight"
                    required
                  />
                </td>
                <td className="self-stretch pl-2.5 pr-6  bg-white text-stone-900 justify-start items-center ">
                  ₹{service.total.toFixed(2)}
                </td>
                <td className="self-stretch pl-2.5 pr-6 py-4 bg-white  justify-start items-center text-center">
                  <button
                    type="button"
                    onClick={() =>
                      onChange(services.filter((_, i) => i !== index))
                    }
                    className="text-red-500 hover:text-red-700"
                    disabled={services.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={addService}
        className="flex items-center text-sm bg-pink-600 font-medium font-['Inter'] text-white px-3 py-1 rounded hover:bg-pink-700"
      >
        <Plus size={16} className="mr-1" />
        Add Service
      </button>
    </div>
  );
};

export default ServicesSection;
