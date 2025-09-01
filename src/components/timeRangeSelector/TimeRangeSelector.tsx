import React, { useState } from 'react';
import { DatePicker, TimePicker, Button } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

interface TimeRange {
  startDate: Dayjs;
  endDate: Dayjs;
  startTime: Dayjs;
  endTime: Dayjs;
}

interface TimeRangeSelectorProps {
  onSearch: (priceRange: TimeRange, plRange: TimeRange) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ onSearch }) => {
  // 价格时间区间状态
  const [priceTimeRange, setPriceTimeRange] = useState<TimeRange>({
    startDate: dayjs().startOf('day'),
    endDate: dayjs().endOf('day'),
    startTime: dayjs().startOf('day').hour(0).minute(0),
    endTime: dayjs().startOf('day').hour(23).minute(59)
  });

  // 盈亏计算时间区间状态
  const [plTimeRange, setPlTimeRange] = useState<TimeRange>({
    startDate: dayjs().subtract(7, 'day').startOf('day'),
    endDate: dayjs().endOf('day'),
    startTime: dayjs().startOf('day').hour(0).minute(0),
    endTime: dayjs().startOf('day').hour(23).minute(59)
  });

  // 处理查询按钮点击
  const handleSearch = () => {
    onSearch(priceTimeRange, plTimeRange);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24, padding: '0 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{ whiteSpace: 'nowrap' }}>价格区间:</span>
        <DatePicker
          value={priceTimeRange.startDate}
          onChange={(date) => setPriceTimeRange({ ...priceTimeRange, startDate: date })}
          style={{ width: 140 }}
        />
        <TimePicker
          value={priceTimeRange.startTime}
          onChange={(time) => setPriceTimeRange({ ...priceTimeRange, startTime: time })}
          format="HH:mm"
          style={{ width: 100 }}
        />
        <span style={{ whiteSpace: 'nowrap' }}>-</span>
        <DatePicker
          value={priceTimeRange.endDate}
          onChange={(date) => setPriceTimeRange({ ...priceTimeRange, endDate: date })}
          style={{ width: 140 }}
        />
        <TimePicker
          value={priceTimeRange.endTime}
          onChange={(time) => setPriceTimeRange({ ...priceTimeRange, endTime: time })}
          format="HH:mm"
          style={{ width: 100 }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{ whiteSpace: 'nowrap' }}>盈亏区间:</span>
        <DatePicker
          value={plTimeRange.startDate}
          onChange={(date) => setPlTimeRange({ ...plTimeRange, startDate: date })}
          style={{ width: 140 }}
        />
        <TimePicker
          value={plTimeRange.startTime}
          onChange={(time) => setPlTimeRange({ ...plTimeRange, startTime: time })}
          format="HH:mm"
          style={{ width: 100 }}
        />
        <span style={{ whiteSpace: 'nowrap' }}>-</span>
        <DatePicker
          value={plTimeRange.endDate}
          onChange={(date) => setPlTimeRange({ ...plTimeRange, endDate: date })}
          style={{ width: 140 }}
        />
        <TimePicker
          value={plTimeRange.endTime}
          onChange={(time) => setPlTimeRange({ ...plTimeRange, endTime: time })}
          format="HH:mm"
          style={{ width: 100 }}
        />
      </div>

      <Button type="primary" onClick={handleSearch} style={{ flexShrink: 0 }}>查询</Button>
    </div>
  );
};

export default TimeRangeSelector;