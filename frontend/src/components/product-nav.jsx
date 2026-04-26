import { Link, useLocation } from "react-router-dom";

export function ProductNav({ id }) {
  const location = useLocation();

  const tabs = [
    { href: `/product/${id}`, label: "Overview" },
    { href: `/product/${id}/prices`, label: "Prices & Deals" },
    { href: `/product/${id}/compare`, label: "Compare" },
    { href: `/product/${id}/reviews`, label: "Reviews" },
  ];

  return (
    <div className="flex gap-4 border-b pb-2">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          to={tab.href}
          className={
            location.pathname === tab.href
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-400"
          }
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}