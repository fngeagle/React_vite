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
  // 默认时间范围设置为当前日
  const getDefaultTimeRange = () => ({
    startDate: dayjs().startOf('day'),
    endDate: dayjs().endOf('day'),
    startTime: dayjs().startOf('day').hour(0).minute(0),
    endTime: dayjs().startOf('day').hour(23).minute(59)
  });

  // 将JSON对象转换为TimeRange对象，确保dayjs对象正确
  const parseTimeRange = (jsonString: string | null) => {
    if (!jsonString) return null;
    
    try {
      const parsed = JSON.parse(jsonString);
      return {
        startDate: parsed.startDate ? dayjs(parsed.startDate) : dayjs().startOf('day'),
        endDate: parsed.endDate ? dayjs(parsed.endDate) : dayjs().endOf('day'),
        startTime: parsed.startTime ? dayjs(parsed.startTime) : dayjs().startOf('day').hour(0).minute(0),
        endTime: parsed.endTime ? dayjs(parsed.endTime) : dayjs().startOf('day').hour(23).minute(59)
      };
    } catch (error) {
      console.error('解析时间范围失败:', error);
      return null;
    }
  };

  // 价格时间区间状态
  const [priceTimeRange, setPriceTimeRange] = useState<TimeRange>(() => {
    // 从localStorage中读取保存的时间，如果没有则使用默认值
    const savedPriceTimeRange = localStorage.getItem('priceTimeRange');
    const parsed = parseTimeRange(savedPriceTimeRange);
    return parsed || getDefaultTimeRange();
  });

  // 盈亏计算时间区间状态
  const [plTimeRange, setPlTimeRange] = useState<TimeRange>(() => {
    // 从localStorage中读取保存的时间，如果没有则使用默认值
    const savedPlTimeRange = localStorage.getItem('plTimeRange');
    const parsed = parseTimeRange(savedPlTimeRange);
    return parsed || getDefaultTimeRange();
  });

  // 期货选择器状态
  const [futures, setFutures] = useState<FutureItem[]>([]);
  const [selectedFutureId, setSelectedFutureId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 保存时间范围到localStorage
  useEffect(() => {
    localStorage.setItem('priceTimeRange', JSON.stringify(priceTimeRange));
  }, [priceTimeRange]);

  useEffect(() => {
    localStorage.setItem('plTimeRange', JSON.stringify(plTimeRange));
  }, [plTimeRange]);

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

  // 重置时间范围到默认值
  const handleReset = () => {
    const defaultTimeRange = getDefaultTimeRange();
    setPriceTimeRange(defaultTimeRange);
    setPlTimeRange(defaultTimeRange);
  };

  // 组件挂载时获取期货数据
  useEffect(() => {
    fetchFutures();
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1%', marginBottom: 24, padding: '0 16px' }}>
      {/* 期货选择器 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1%', flex: '0 0 10%' }}>
        <span style={{ whiteSpace: 'nowrap' }}>期货:</span>
        <Select
          value={selectedFutureId}
          onChange={setSelectedFutureId}
          loading={loading}
          style={{ width: '100%' }}
          placeholder="请选择期货"
        >
          {futures.map(future => (
            <Option key={future.id} value={future.id}>
              {future.symbol}
            </Option>
          ))}
        </Select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1%', flex: '0 0 32.5%' }}>
        <span style={{ whiteSpace: 'nowrap' }}>价格区间:</span>
        <DatePicker
          value={priceTimeRange.startDate}
          onChange={(date) => setPriceTimeRange({ ...priceTimeRange, startDate: date })}
          style={{ flex: 1 }}
        />
        <TimePicker
          value={priceTimeRange.startTime}
          onChange={(time) => setPriceTimeRange({ ...priceTimeRange, startTime: time })}
          format="HH:mm"
          style={{ flex: 0.8 }}
        />
        <span style={{ whiteSpace: 'nowrap' }}>-</span>
        <DatePicker
          value={priceTimeRange.endDate}
          onChange={(date) => setPriceTimeRange({ ...priceTimeRange, endDate: date })}
          style={{ flex: 1 }}
        />
        <TimePicker
          value={priceTimeRange.endTime}
          onChange={(time) => setPriceTimeRange({ ...priceTimeRange, endTime: time })}
          format="HH:mm"
          style={{ flex: 0.8 }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1%', flex: '0 0 32.5%' }}>
        <span style={{ whiteSpace: 'nowrap' }}>盈亏区间:</span>
        <DatePicker
          value={plTimeRange.startDate}
          onChange={(date) => setPlTimeRange({ ...plTimeRange, startDate: date })}
          style={{ flex: 1 }}
        />
        <TimePicker
          value={plTimeRange.startTime}
          onChange={(time) => setPlTimeRange({ ...plTimeRange, startTime: time })}
          format="HH:mm"
          style={{ flex: 0.8 }}
        />
        <span style={{ whiteSpace: 'nowrap' }}>-</span>
        <DatePicker
          value={plTimeRange.endDate}
          onChange={(date) => setPlTimeRange({ ...plTimeRange, endDate: date })}
          style={{ flex: 1 }}
        />
        <TimePicker
          value={plTimeRange.endTime}
          onChange={(time) => setPlTimeRange({ ...plTimeRange, endTime: time })}
          format="HH:mm"
          style={{ flex: 0.8 }}
        />
      </div>

      <Button type="primary" onClick={handleSearch} style={{ flex: '0 0 auto' }}>查询</Button>
      <Button onClick={handleReset} style={{ flex: '0 0 auto' }}>重置时间</Button>
    </div>
  );
};

export default TimeRangeSelector;