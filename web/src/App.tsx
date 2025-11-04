import { Layout, Menu, Button, Typography, Space } from 'antd';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AppRoutes } from './routes';
import { useSessionStore } from './store/session';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clear } = useSessionStore();

  const selectedKey = '/' + (location.pathname.split('/')[1] ?? '');

  const handleLogout = () => {
    clear();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ color: '#fff', fontWeight: 600, fontSize: 18 }}>
          <Link to="/" style={{ color: 'inherit' }}>LinkNote</Link>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={[
            { key: '/files', label: <NavLink to="/files">Files</NavLink> },
            { key: '/notes', label: <NavLink to="/notes">Notes</NavLink> },
            { key: '/questions', label: <NavLink to="/questions">Questions</NavLink> },
            { key: '/wrong-answers', label: <NavLink to="/wrong-answers">Wrong Answers</NavLink> },
            { key: '/ask', label: <NavLink to="/ask">Ask</NavLink> },
          ]}
          style={{ flex: 1 }}
        />
        <Space>
          {user ? (
            <>
              <Text style={{ color: '#fff' }}>{user.username}</Text>
              <Button size="small" onClick={handleLogout}>
                退出
              </Button>
            </>
          ) : (
            <>
              <Button size="small" type="primary" onClick={() => navigate('/login')}>
                登录
              </Button>
              <Button size="small" onClick={() => navigate('/register')}>
                注册
              </Button>
            </>
          )}
        </Space>
      </Header>
      <Content>
        <div className="app-content">
          <AppRoutes />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        LinkNote © {new Date().getFullYear()} — React + Vite
      </Footer>
    </Layout>
  );
}

export default App;
