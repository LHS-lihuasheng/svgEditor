"use client"

import { useMemo, useEffect } from 'react';
import { findControlForProperty } from './utils';
import type { PropertyControl } from '@/types/core';
import _ from 'lodash';

interface DynamicPropertyControlProps {
  property: PropertyControl;
  value: any;
  onChange: (value: any) => void;
}

export function DynamicPropertyControl({
  property,
  value,
  onChange,
}: DynamicPropertyControlProps) {
  const Control = useMemo(() => findControlForProperty(property), [property]);


  useEffect(() => {
    if (_.isNil(value) && !_.isNil(property.defaultValue)) {
      onChange(property.defaultValue);
    }
  }, [property.property, property.defaultValue, value, onChange]);

  const safeValue = _.isNil(value) ? property.defaultValue : value;

  if (!Control) {
    return <div className="text-sm text-red-500">不支持的属性类型: {property.type}</div>;
  }

  // 特殊处理多值类型控件
  if (property.type === 'quadValue') {
    return <Control
      {...property}
      fields={property.fieldConfig || []}
      value={safeValue}
      onChange={onChange}
    />;
  }

  return <Control {...property} value={safeValue} onChange={onChange} />;
}