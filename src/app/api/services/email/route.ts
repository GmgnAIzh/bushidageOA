import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// 创建邮件传输器
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const { to, subject, content, type = 'text' } = await request.json()

    if (!to || !subject || !content) {
      return NextResponse.json(
        { error: '收件人、主题和内容不能为空' },
        { status: 400 }
      )
    }

    // 检查邮件服务配置
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('⚠️ 邮件服务未配置，使用演示模式')

      // 演示模式 - 模拟发送成功
      return NextResponse.json({
        success: true,
        message: '邮件发送成功（演示模式）',
        details: {
          to,
          subject,
          messageId: `demo_${Date.now()}`,
          timestamp: new Date().toISOString()
        }
      })
    }

    // 真实邮件发送
    const transporter = createTransporter()

    const mailOptions = {
      from: `"智慧OA系统" <${process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text: type === 'text' ? content : undefined,
      html: type === 'html' ? content : undefined,
    }

    const result = await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: '邮件发送成功',
      details: {
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('邮件发送失败:', error)
    return NextResponse.json(
      {
        error: '邮件发送失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

// 发送验证码邮件
export async function PUT(request: NextRequest) {
  try {
    const { email, code, type = '验证码' } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: '邮箱和验证码不能为空' },
        { status: 400 }
      )
    }

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; font-size: 24px;">智慧OA系统</h1>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">您的${type}</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            您请求的验证码如下，请在10分钟内使用：
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #007bff;
                         background: #e7f3ff; padding: 10px 20px; border-radius: 6px;
                         letter-spacing: 8px;">${code}</span>
          </div>
          <p style="color: #999; font-size: 14px;">
            如果您没有请求此验证码，请忽略此邮件。
          </p>
        </div>

        <div style="text-align: center; color: #999; font-size: 12px;">
          <p>此邮件由系统自动发送，请勿回复。</p>
          <p>© 2024 智慧OA系统. 保留所有权利。</p>
        </div>
      </div>
    `

    // 发送邮件
    const result = await POST(new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({
        to: email,
        subject: `【智慧OA】您的${type}`,
        content: emailContent,
        type: 'html'
      })
    }))

    return result

  } catch (error) {
    console.error('发送验证码邮件失败:', error)
    return NextResponse.json(
      { error: '发送验证码邮件失败' },
      { status: 500 }
    )
  }
}

// 测试邮件配置
export async function GET(request: NextRequest) {
  try {
    const isConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS)

    return NextResponse.json({
      success: true,
      configured: isConfigured,
      config: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || '587',
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER ? '已配置' : '未配置'
      },
      message: isConfigured ? '邮件服务已配置' : '邮件服务未配置（演示模式）'
    })

  } catch (error) {
    console.error('检查邮件配置失败:', error)
    return NextResponse.json(
      { error: '检查邮件配置失败' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
