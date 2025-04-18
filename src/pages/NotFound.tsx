
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <div className="flex justify-center mb-4 text-primary">
          <Clock size={64} />
        </div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          الصفحة اللي بتدور عليها مش موجودة
        </p>
        <Button onClick={() => navigate('/')}>
          الرجوع للصفحة الرئيسية
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
