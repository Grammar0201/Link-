import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Typography, InputNumber, message } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { register } from '@/services/auth';
import { useSessionStore } from '@/store/session';

const { Title, Paragraph } = Typography;

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useSessionStore();
  const [loading, setLoading] = useState(false);
  const redirectPath = (location.state as { from?: string } | null)?.from ?? '/files';

  useEffect(() => {
    if (user) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, redirectPath]);

  const onFinish = async (values: { username: string; email: string; password: string; confirm: string; avatarIndex: number }) => {
    setLoading(true);
    try {
      const payload = {
        username: values.username,
        email: values.email,
        password: values.password,
        avatarIndex: values.avatarIndex ?? 0,
      };
      const res = await register(payload);
      setUser(res);
      message.success('注册成功，已登录');
      navigate(redirectPath, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 480, margin: '0 auto' }}>
      <Title level={4}>注册</Title>
      <Paragraph type="secondary">创建新账号以使用 LinkNote。</Paragraph>
      <Form layout="vertical" onFinish={onFinish} requiredMark={false} initialValues={{ avatarIndex: 0 }}>
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: '请输入用户名' }, { min: 3, message: '至少 3 个字符' }]}
        >
          <Input placeholder="用户名" autoComplete="username" />
        </Form.Item>
        <Form.Item
          label="邮箱"
          name="email"
          rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}
        >
          <Input placeholder="邮箱" autoComplete="email" />
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '至少 6 位字符' }]}
        >
          <Input.Password placeholder="密码" autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          label="确认密码"
          name="confirm"
          dependencies={['password']}
          rules={[
            { required: true, message: '请再次输入密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="确认密码" autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          label="头像索引"
          name="avatarIndex"
          tooltip="可根据后端配置选择头像序号"
          rules={[{ required: true, message: '请输入头像索引' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            注册并登录
          </Button>
        </Form.Item>
      </Form>
      <Paragraph style={{ marginBottom: 0 }}>
        已有账号？<Link to="/login">去登录</Link>
      </Paragraph>
    </Card>
  );
}
