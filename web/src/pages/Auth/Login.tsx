import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '@/services/auth';
import { useSessionStore } from '@/store/session';

const { Title, Paragraph } = Typography;

export default function Login() {
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

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await login(values);
      setUser(res);
      message.success('登录成功');
      navigate(redirectPath, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 420, margin: '0 auto' }}>
      <Title level={4}>登录</Title>
      <Paragraph type="secondary">输入用户名与密码以访问 LinkNote。</Paragraph>
      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input autoComplete="username" placeholder="用户名" />
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password autoComplete="current-password" placeholder="密码" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            登录
          </Button>
        </Form.Item>
      </Form>
      <Paragraph style={{ marginBottom: 0 }}>
        还没有账号？<Link to="/register">去注册</Link>
      </Paragraph>
    </Card>
  );
}
