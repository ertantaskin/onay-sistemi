import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

// Admin yetkisi kontrolü için middleware
async function isAdmin(session: any) {
  if (!session || !session.user || session.user.role !== 'admin') {
    return false;
  }
  return true;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!await isAdmin(session)) {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekiyor.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    await dbConnect();

    // Arama kriterlerini oluştur
    const searchCriteria = search
      ? {
          $or: [
            { email: { $regex: search, $options: 'i' } },
            { name: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    // Toplam kayıt sayısını al
    const total = await User.countDocuments(searchCriteria);

    // Kullanıcıları getir
    const users = await User.find(searchCriteria)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        credit: user.credit,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Kullanıcı listesi hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcı listesi alınırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!await isAdmin(session)) {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekiyor.' },
        { status: 403 }
      );
    }

    const { userId, isActive, credit } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gereklidir.' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Güncellenecek alanları belirle
    const updateData: any = {};
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (typeof credit === 'number') updateData.credit = credit;

    // Kullanıcıyı güncelle
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Kullanıcı başarıyla güncellendi.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        credit: user.credit,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcı güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 