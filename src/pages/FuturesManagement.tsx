import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Button, Table, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  getAllFutures,
  createFuture,
  updateFuture,
  deleteFuture,
  deleteFuturesBatch,
  searchFutures
} from '../services/futuresService';
import type { FutureItem } from '../services/futuresService';
import AddFutureModal from '../components/modals/AddFutureModal';
import EditFutureModal from '../components/modals/EditFutureModal';

const FuturesManagement: React.FC = () => {
  // 搜索关键字状态
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // 控制新增模态框显示状态
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  
  // 控制编辑模态框显示状态
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  
  // 当前编辑的记录
  const [currentRecord, setCurrentRecord] = useState<FutureItem | null>(null);
  
  // 选中的行
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // 期货数据
  const [futuresData, setFuturesData] = useState<FutureItem[]>([]);
  
  // 加载状态
  const [loading, setLoading] = useState(false);
  
  // 表格列定义
  const columns: ColumnsType<FutureItem> = [
    {
      title: '名称',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '价格',
      dataIndex: 'price_per_point',
      key: 'price_per_point',
      render: (price: number) => `¥${price.toLocaleString()}`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => showEditModal(record)}>编辑</a>
          <a onClick={() => handleDelete(record.id)}>删除</a>
        </Space>
      ),
    },
  ];
  
  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };
  
  // 获取所有期货数据
  const fetchFuturesData = async () => {
    setLoading(true);
    try {
      const data = await getAllFutures();
      setFuturesData(data);
    } catch (error) {
      console.error('获取期货数据失败:', error);
      message.error('获取期货数据失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 处理搜索
  const handleSearch = async () => {
    setLoading(true);
    try {
      if (!searchKeyword.trim()) {
        // 如果搜索关键字为空，获取所有数据
        await fetchFuturesData();
      } else {
        // 搜索数据
        const data = await searchFutures(searchKeyword);
        setFuturesData(data);
      }
    } catch (error) {
      console.error('搜索期货数据失败:', error);
      message.error('搜索期货数据失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 重置搜索
  const handleReset = async () => {
    setSearchKeyword('');
    await fetchFuturesData();
  };
  
  // 显示编辑模态框
  const showEditModal = (record: FutureItem) => {
    setCurrentRecord(record);
    setIsEditModalVisible(true);
  };
  
  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      await deleteFuture(id);
      message.success('删除成功');
      // 重新获取数据
      await fetchFuturesData();
    } catch (error) {
      console.error('删除期货数据失败:', error);
      message.error('删除期货数据失败');
    }
  };
  
  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请至少选择一条记录');
      return;
    }
    
    try {
      // 将React.Key[]转换为string[]
      const ids = selectedRowKeys.map(key => key.toString());
      await deleteFuturesBatch(ids);
      setSelectedRowKeys([]);
      message.success(`成功删除${selectedRowKeys.length}条记录`);
      // 重新获取数据
      await fetchFuturesData();
    } catch (error) {
      console.error('批量删除期货数据失败:', error);
      message.error('批量删除期货数据失败');
    }
  };
  
  // 显示新增模态框
  const showAddModal = () => {
    setIsAddModalVisible(true);
  };
  
  // 处理新增模态框确认
  const handleAddOk = async (values: Omit<FutureItem, 'id'>) => {
    try {
      // 创建新的期货数据
      const newFuture = await createFuture(values);
      
      // 更新数据
      setFuturesData([...futuresData, newFuture]);
      
      // 关闭模态框
      setIsAddModalVisible(false);
      message.success('新增成功');
    } catch (error) {
      console.error('新增期货数据失败:', error);
      message.error('新增期货数据失败');
    }
  };
  
  // 处理编辑模态框确认
  const handleEditOk = async (values: Omit<FutureItem, 'id'>) => {
    if (!currentRecord) return;
    
    try {
      // 更新数据
      const updatedFuture = await updateFuture(currentRecord.id, values);
      
      // 更新状态
      const newData = futuresData.map(item => 
        item.id === currentRecord.id ? updatedFuture : item
      );
      setFuturesData(newData);
      setCurrentRecord(null);
      
      // 关闭模态框
      setIsEditModalVisible(false);
      message.success('编辑成功');
    } catch (error) {
      console.error('编辑期货数据失败:', error);
      message.error('编辑期货数据失败');
    }
  };
  
  // 组件挂载时获取数据
  useEffect(() => {
    fetchFuturesData();
  }, []);
  
  return (
    <div>
      <h2>期货管理</h2>
      
      {/* 搜索组件 */}
      <Card style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Input 
              placeholder="请输入期货名称" 
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col span={8}>
            <Button type="primary" onClick={handleSearch} style={{ marginRight: 8 }}>
              搜索
            </Button>
            <Button onClick={handleReset}>
              重置
            </Button>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={showAddModal} style={{ marginRight: 8 }}>
              新增
            </Button>
            <Button type="primary" danger onClick={handleBatchDelete}>
              批量删除
            </Button>
          </Col>
        </Row>
      </Card>
      
      {/* 表格组件 */}
      <Card>
        <Table 
          loading={loading}
          rowSelection={rowSelection}
          columns={columns} 
          dataSource={futuresData} 
          rowKey="id"
          pagination={{
            pageSize: 5,
          }}
        />
      </Card>
      
      {/* 新增期货数据模态框 */}
      <AddFutureModal
        visible={isAddModalVisible}
        onOk={handleAddOk}
        onCancel={() => setIsAddModalVisible(false)}
      />
      
      {/* 编辑期货数据模态框 */}
      <EditFutureModal
        visible={isEditModalVisible}
        record={currentRecord}
        onOk={handleEditOk}
        onCancel={() => {
          setIsEditModalVisible(false);
          setCurrentRecord(null);
        }}
      />
    </div>
  );
};

export default FuturesManagement;