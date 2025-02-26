import React from "react";
import { Container, Typography, Box, List, ListItem, Paper, Link } from "@mui/material";

export async function generateMetadata() {
  return {
    title: "JamMy - プライバシーポリシー",
    description: "JamMyのプライバシーポリシーについての記載ページです",
  };
}

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2, backgroundColor: "#f9f9f9" }}>
        <Box textAlign="center" mb={3}>
          <Typography fontWeight="bold" color="primary" gutterBottom sx={{ fontSize: "1.75rem" }}>
            プライバシーポリシー
          </Typography>
        </Box>

        <Box mb={3}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            1. 収集する情報
          </Typography>
          <Typography>本サービスでは、以下の情報を収集する場合があります。</Typography>
          <List>
            <ListItem>Googleアカウント情報（認証のため）</ListItem>
            <ListItem>ユーザーが入力した音声データおよび関連するメタデータ</ListItem>
            <ListItem>アプリの利用状況（アクセス解析のため）</ListItem>
            <ListItem>デバイス情報（マイク使用のため）</ListItem>
          </List>
        </Box>

        <Box mb={3}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            2. 情報の利用目的
          </Typography>
          <Typography>収集した情報は、以下の目的で利用します。</Typography>
          <List>
            <ListItem>本サービスの提供および運営</ListItem>
            <ListItem>利用状況の分析によるサービス向上</ListItem>
            <ListItem>必要な情報の通知</ListItem>
          </List>
        </Box>

        <Box mb={3}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            3. 情報の管理
          </Typography>
          <List>
            <ListItem>ユーザーの個人情報は、適切な管理のもと第三者に提供されません。</ListItem>
            <ListItem>ただし、法令に基づき開示が必要な場合はこの限りではありません。</ListItem>
          </List>
        </Box>

        <Box mb={3}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            4. クッキー（Cookie）およびトラッキング
          </Typography>
          <Typography>
            本サービスでは、ユーザー体験向上のためCookieを使用することがあります。ユーザーはブラウザの設定によりCookieを拒否できますが、その場合、一部機能が利用できなくなる可能性があります。
          </Typography>
        </Box>

        <Box mb={3}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            5. デバイスアクセスに関して
          </Typography>
          <Typography>
            本サービスでは、録音機能を提供するためにマイクデバイスへのアクセスを求めます。ユーザーは、適切な権限を許可した上でご利用ください。
          </Typography>
        </Box>

        <Box mb={3}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            6. プライバシーポリシーの変更
          </Typography>
          <Typography>
            本ポリシーは、必要に応じて変更されることがあります。変更後のポリシーは、本サービス上に掲載された時点で効力を生じるものとします。
          </Typography>
        </Box>

        <Box mb={3}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            7. お問い合わせ
          </Typography>
          <Typography>
            本規約およびプライバシーポリシーに関するお問い合わせは、以下のフォームからお願いいたします。
          </Typography>
          <Link href="https://docs.google.com/forms/d/e/1FAIpQLSf2F2t-i6hRg20p24Qq_en1MhfNxeXD2mDeqqpy2uGuYLDxog/viewform" target="_blank" rel="noopener">
            お問い合わせフォーム
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;
