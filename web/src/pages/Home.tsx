import { Card, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <Card>
      <Title level={3}>欢迎使用 LinkNote 前端</Title>
      <Paragraph>此为 Milestone 0：完成脚手架、代理、布局、HTTP 封装与会话存储。</Paragraph>
      <Paragraph>
        你可以前往 <Link to="/files">Files</Link>、<Link to="/notes">Notes</Link>、
        <Link to="/questions">Questions</Link>、<Link to="/wrong-answers">Wrong Answers</Link> 或 <Link to="/ask">Ask</Link> 页面。
      </Paragraph>
    </Card>
  );
}

