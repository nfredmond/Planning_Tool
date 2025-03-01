declare module 'recharts' {
  import * as React from 'react';

  export interface LineProps {
    yAxisId?: string;
    type?: string;
    dataKey?: string;
    name?: string;
    stroke?: string;
    activeDot?: object;
    [key: string]: any;
  }

  export interface TooltipProps {
    [key: string]: any;
  }

  export interface LegendProps {
    [key: string]: any;
  }

  export interface XAxisProps {
    dataKey?: string;
    [key: string]: any;
  }

  export interface YAxisProps {
    yAxisId?: string;
    orientation?: string;
    [key: string]: any;
  }

  export interface CartesianGridProps {
    strokeDasharray?: string;
    [key: string]: any;
  }

  export interface ResponsiveContainerProps {
    width?: string | number;
    height?: string | number;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export const LineChart: React.FC<{
    data?: any[];
    children?: React.ReactNode;
    [key: string]: any;
  }>;

  export const Line: React.FC<LineProps>;
  export const XAxis: React.FC<XAxisProps>;
  export const YAxis: React.FC<YAxisProps>;
  export const CartesianGrid: React.FC<CartesianGridProps>;
  export const Tooltip: React.FC<TooltipProps>;
  export const Legend: React.FC<LegendProps>;
  export const ResponsiveContainer: React.FC<ResponsiveContainerProps>;
  export const BarChart: React.FC<any>;
  export const Bar: React.FC<any>;
  export const PieChart: React.FC<any>;
  export const Pie: React.FC<any>;
  export const Cell: React.FC<any>;
} 