import React, { useState, useEffect } from 'react';
import { DatePicker, TimePicker, Button, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { getAllFutures } from '../../services/futuresService';
import type { FutureItem } from '../../services/futuresService';

const { Option } = Select;

interface TimeRange {
  startDate: Dayjs;
  endDate: Dayjs;
  startTime: Dayjs;
  endTime: Dayjs;
}

interface TimeRangeSelectorProps {
  onSearch: (priceRange: TimeRange, plRange: TimeRange, selectedFuture: FutureItem | null) => void;
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

  // 期货选择器状态
  const [futures, setFutures] = useState<FutureItem[]>([]);
  const [selectedFutureId, setSelectedFutureId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 获取期货数据
  const fetchFutures = async () => {
    setLoading(true);
    try {
      const data = await getAllFutures();
      setFutures(data);
      // 默认选择第一个期货
      if (data.length > 0) {
        setSelectedFutureId(data[0].id);
      }
    } catch (error) {
      console.error('获取期货数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理查询按钮点击
  const handleSearch = () => {
    // 根据选中的期货ID找到对应的期货对象
    const selectedFuture = futures.find(future => future.id === selectedFutureId) || null;
    onSearch(priceTimeRange, plTimeRange, selectedFuture);
  };

  // 组件挂载时获取期货数据
  useEffect(() => {
    fetchFutures();
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24, padding: '0 16px' }}>
      {/* 期货选择器 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{ whiteSpace: 'nowrap' }}>期货:</span>
        <Select
          value={selectedFutureId}
          onChange={setSelectedFutureId}
          loading={loading}
          style={{ width: 200 }}
          placeholder="请选择期货"
        >
          {futures.map(future => (
            <Option key={future.id} value={future.id}>
              {future.symbol}
            </Option>
          ))}
        </Select>
      </div>

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