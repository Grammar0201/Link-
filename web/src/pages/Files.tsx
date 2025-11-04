import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Empty,
  Popconfirm,
  Space,
  Table,
  Typography,
  Upload,
  message,
} from 'antd';
import { UploadOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import type { ColumnsType } from 'antd/es/table';
import { fetchUserFiles, removeFile, uploadPdf } from '@/services/files';
import { useSessionStore } from '@/store/session';
import type { PdfDocument } from '@/types';

const MAX_POLL_ATTEMPTS = 5;
const POLL_DELAY_MS = 3000;
const MAX_FILE_SIZE = 60 * 1024 * 1024; // 60MB

function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export default function Files() {
  const { user } = useSessionStore();
  const [files, setFiles] = useState<PdfDocument[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [pollAttempt, setPollAttempt] = useState(0);
  const pollTimerRef = useRef<number | null>(null);

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current !== null) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const loadFiles = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!user) {
        setFiles([]);
        return [] as PdfDocument[];
      }
      if (!options?.silent) {
        setListLoading(true);
      }
      try {
        const data = await fetchUserFiles(user.id);
        setFiles(data);
        return data;
      } catch (error) {
        return [] as PdfDocument[];
      } finally {
        if (!options?.silent) {
          setListLoading(false);
        }
      }
    },
    [user]
  );

  const pollForFiles = useCallback(
    (initialCount: number, attempt = 1) => {
      setPolling(true);
      setPollAttempt(attempt);
      clearPollTimer();
      pollTimerRef.current = window.setTimeout(async () => {
        const latest = await loadFiles({ silent: true });
        if (latest.length > initialCount) {
          setPolling(false);
          setProcessingMessage(null);
          clearPollTimer();
          return;
        }
        if (attempt >= MAX_POLL_ATTEMPTS) {
          message.info('文件仍在处理，请稍后手动刷新查看最新状态。');
          setPolling(false);
          clearPollTimer();
          return;
        }
        pollForFiles(initialCount, attempt + 1);
      }, POLL_DELAY_MS);
    },
    [clearPollTimer, loadFiles]
  );

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => () => clearPollTimer(), [clearPollTimer]);

  const handleUploadChange = ({ fileList }: { fileList: UploadFile[] }) => {
    if (!fileList.length) {
      setUploadFileList([]);
      return;
    }
    const latestList = fileList.slice(-1);
    const latest = latestList[0];
    const origin = latest?.originFileObj as RcFile | undefined;
    if (origin) {
      const isPdf =
        origin.type === 'application/pdf' || origin.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        message.error('仅支持 PDF 文件上传');
        setUploadFileList([]);
        return;
      }
      if (origin.size > MAX_FILE_SIZE) {
        message.error('文件大小不能超过 60MB');
        setUploadFileList([]);
        return;
      }
    }
    setUploadFileList(latestList);
  };

  const handleUpload = async () => {
    if (!user) {
      message.error('请先登录后再上传文件');
      return;
    }
    if (!uploadFileList.length) {
      message.warning('请选择需要上传的 PDF 文件');
      return;
    }
    const target = uploadFileList[0].originFileObj as RcFile | undefined;
    if (!target) {
      message.error('未找到有效的文件内容，请重新选择文件');
      return;
    }
    const formData = new FormData();
    formData.append('file', target);
    formData.append('userId', String(user.id));
    setUploading(true);
    try {
      const res = await uploadPdf(formData);
      if (res?.message) {
        setProcessingMessage(res.message);
      } else {
        setProcessingMessage('文件上传请求已提交，后台处理中');
      }
      setUploadFileList([]);
      pollForFiles(files.length);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: number) => {
    setDeletingId(fileId);
    try {
      const res = await removeFile(fileId);
      if (typeof res === 'string') {
        message.success(res);
      } else if (res && typeof res === 'object' && 'message' in res && res.message) {
        message.success(res.message);
      } else {
        message.success('文件删除成功');
      }
      await loadFiles();
    } finally {
      setDeletingId(null);
    }
  };

  const columns: ColumnsType<PdfDocument> = [
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (value?: string | null) => value ?? '-',
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
      render: (value?: string | null) => formatDateTime(value),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title="删除文件"
          description="确认删除该文件及其关联数据？"
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true, loading: deletingId === record.id }}
          onConfirm={() => handleDelete(record.id)}
        >
          <Button
            size="small"
            danger
            type="text"
            icon={<DeleteOutlined />}
            loading={deletingId === record.id}
          >
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="上传文件" bordered>
        <Space size="middle" direction="vertical" style={{ width: '100%' }}>
          <Upload
            accept=".pdf,application/pdf"
            beforeUpload={() => false}
            maxCount={1}
            fileList={uploadFileList}
            onChange={handleUploadChange}
            onRemove={() => {
              setUploadFileList([]);
              return true;
            }}
            disabled={uploading}
          >
            <Button icon={<UploadOutlined />} disabled={uploading}>
              选择 PDF 文件
            </Button>
          </Upload>
          <Space>
            <Button
              type="primary"
              onClick={handleUpload}
              loading={uploading}
              disabled={!uploadFileList.length || uploading}
            >
              提交上传
            </Button>
            <Button
              onClick={() => setUploadFileList([])}
              disabled={!uploadFileList.length || uploading}
            >
              清除选择
            </Button>
          </Space>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            支持上传单个 PDF 文件，单个文件大小不超过 60MB。上传后系统会后台解析生成相关数据。
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card
        title="我的文件"
        extra={(
          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadFiles()}
            loading={listLoading}
          >
            刷新
          </Button>
        )}
      >
        {processingMessage && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message={processingMessage}
            description={
              polling
                ? `后台处理中，正在尝试刷新列表（第 ${pollAttempt} 次，共 ${MAX_POLL_ATTEMPTS} 次）。`
                : '若列表未及时更新，可点击右上角的刷新按钮手动获取最新状态。'
            }
          />
        )}
        <Table<PdfDocument>
          rowKey="id"
          dataSource={files}
          columns={columns}
          loading={listLoading}
          pagination={false}
          locale={{ emptyText: <Empty description="暂无上传文件" /> }}
        />
      </Card>
    </Space>
  );
}
