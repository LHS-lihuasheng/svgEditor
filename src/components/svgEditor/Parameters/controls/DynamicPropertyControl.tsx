"use client"

import { useMemo, useEffect } from 'react';
import { findControlForProperty } from './utils';
import type { propertyConfig } from '@/types';
import _ from 'lodash';

interface DynamicPropertyControlProps {
  propertyConfig: propertyConfig;
  value: any;
  onChange: (value: any) => void;
}

export function DynamicPropertyControl({
  propertyConfig,
  value,
  onChange,
}: DynamicPropertyControlProps) {
  const Control = useMemo(() => findControlForProperty(propertyConfig), [propertyConfig]);

  useEffect(() => {
    if (_.isNil(value) && !_.isNil(propertyConfig.defaultValue)) {
      onChange(propertyConfig.defaultValue);
    }
  }, [propertyConfig.defaultValue, value, onChange]);

  const safeValue = _.isNil(value) ? propertyConfig.defaultValue : value;

  if (!Control) {
    return <div className="text-sm text-red-500">不支持的属性类型: {propertyConfig.controlType}</div>;
  }

  // 传递统一的参数：propertyConfig, value, onChange
  return <Control
    propertyConfig={propertyConfig}
    value={safeValue}
    onChange={onChange}
  />;
}