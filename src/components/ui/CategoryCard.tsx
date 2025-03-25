
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface CategoryCardProps {
  title: string;
  icon: ReactNode;
  slug: string;
  count?: number;
}

const CategoryCard = ({ title, icon, slug, count }: CategoryCardProps) => {
  return (
    <Link 
      to={`/category/${slug}`}
      className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 
                 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group"
    >
      <div className="rounded-full bg-gray-100 p-4 mb-4 text-gray-600 group-hover:text-usm-gold group-hover:bg-usm-gold/10 transition-colors">
        {icon}
      </div>
      <h3 className="font-medium text-gray-800 group-hover:text-usm-gold transition-colors">
        {title}
      </h3>
      {count !== undefined && (
        <span className="text-xs text-gray-500 mt-1">
          {count} {count === 1 ? 'item' : 'items'}
        </span>
      )}
    </Link>
  );
};

export default CategoryCard;
