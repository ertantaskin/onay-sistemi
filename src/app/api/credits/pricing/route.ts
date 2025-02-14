import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

// GET /api/credits/pricing
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const packages = await prisma.creditPackage.findMany({
      where: { 
        isActive: true,
        paymentMethod: {
          isActive: true
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        paymentMethod: true,
      },
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error('Error fetching credit packages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 