import { useState } from 'react';

const Parameters = () => {
    const [parameters, setParameters] = useState([
        { label: 'Minimum Attendence', name: 'minAttendence', value: 75, min: 0, max: 100 },
    ]);
    const [features, setFeatures] = useState([
        { label: 'Auto send alerts for low attendence', name: 'autoAlertLowAtt', enabled: true },
        { label: 'Auto send alerts for absence', name: 'autoAlertAbsent', enabled: true },
        { label: 'Send alerts for below 50% attendence', name: 'autoAlertBelow50', enabled: true },
    ]);


    const handleSave = () => {
        console.log('Saved parameters:', parameters);
        // Replace with actual save logic
    };

    return (
        <div className="py-4 flex justify-center ">
            <div className='px-4 py-6 flex flex-col gap-4 text-lg border-2 border-gray-300 rounded-md shadow-md bg-white'>
                {parameters.map((param, index) =>
                    <div className='w-full flex justify-between gap-x-4 items-center hover:scale-[1.03] duration-100 bg-gray-100 rounded px-4 py-3' key={index} >
                        <label className='whitespace-nowrap' htmlFor={param.name}>{param.label}</label>
                        <input
                            type='number'
                            min={param.min}
                            max={param.max}
                            name={param.name}
                            value={param.value}
                            className='border-2 border-gray-300 rounded-md px-2 py-1 bg-white'
                            onChange={(e) => {
                                const newParams = [...parameters];
                                newParams[index].value = e.target.value;
                                setParameters(newParams);
                            }}
                        />
                    </div>
                )}
                {features.map((feature, index) =>
                    <div className='w-full flex justify-between gap-x-4 items-center hover:scale-[1.03] duration-100 bg-gray-100 rounded px-4 py-3' key={index} >
                        <label className='whitespace-nowrap' htmlFor={feature.name}>{feature.label}</label>
                        <input
                            type='checkbox'
                            name={feature.name}
                            checked={feature.enabled}
                            className="w-5 h-5 scale-125 accent-green-600"
                            onChange={(e) => {
                                const newFeatures = [...features];
                                newFeatures[index].enabled = e.target.checked;
                                setFeatures(newFeatures);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Parameters;
