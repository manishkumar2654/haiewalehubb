import React from "react";
import classNames from "classnames";
import { CheckCircle, XCircle, Clock, AlertCircle, Info } from "lucide-react";

const statusIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  pending: Clock,
};

const statusColors = {
  success: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
  warning: "bg-yellow-100 text-yellow-800",
  info: "bg-blue-100 text-blue-800",
  pending: "bg-purple-100 text-purple-800",
  default: "bg-gray-100 text-gray-800",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

const Badge = ({
  children,
  status = "default",
  size = "md",
  withIcon = false,
  className = "",
  rounded = "full",
  ...props
}) => {
  const StatusIcon = statusIcons[status];
  const colorClass = statusColors[status] || statusColors.default;
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const roundedClass = rounded === "full" ? "rounded-full" : "rounded-md";

  return (
    <span
      className={classNames(
        "inline-flex items-center font-medium",
        colorClass,
        sizeClass,
        roundedClass,
        className
      )}
      {...props}
    >
      {withIcon && StatusIcon && (
        <StatusIcon
          className={`h-3 w-3 ${size === "lg" ? "h-4 w-4" : ""} mr-1.5`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
