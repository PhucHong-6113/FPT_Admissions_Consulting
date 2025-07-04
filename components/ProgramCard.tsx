import Image from 'next/image';

interface ProgramCardProps {
  title: string;
  description: string[];
  image: string;
  link: string;
}

export default function ProgramCard({ title, description, image, link }: ProgramCardProps) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
      <div className="mb-6">
        <Image 
          src={image} 
          alt={title} 
          width={300} 
          height={200} 
          className="rounded-lg w-full h-48 object-cover" 
        />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <ul className="text-gray-600 text-sm space-y-2 mb-6">
        {description.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
      <button className="text-[#ff6b35] font-semibold hover:text-[#ff8c42]">
        Tìm hiểu thêm →
      </button>
    </div>
  );
}
